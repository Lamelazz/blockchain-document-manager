import { read, write, KEYS, log } from '@/services/storage'

export type Role = 'admin' | 'user'
export type User = {
  username: string
  email: string
  role: Role
  passwordHash: string
  createdAt: number
}
type Session = { username: string }

const AUTH_USERS = 'pd_auth_users'
const AUTH_SESSION = 'pd_auth_session'

// 👉 URL backend của bạn
const API_BASE = 'http://localhost:3000/api/auth'

// Token (nếu backend trả về) – lưu ở localStorage để sau này gọi API khác (documents, shares…)
const TOKEN_KEY = 'auth_token'

function users(): User[] { return read<User[]>(AUTH_USERS, []) }
function saveUsers(list: User[]) { write(AUTH_USERS, list) }

async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('')
}

// ===================================================================
// 1) ĐĂNG KÝ – GỌI BACKEND TRƯỚC, LOCALSTORAGE GIỮ LÀM CACHE
// ===================================================================
export async function register(params: {
  username: string
  email: string
  password: string
  role?: Role
}) {
  const { username, email, password } = params
  const role: Role = params.role || 'user'

  // 1. GỌI BACKEND ĐỂ LƯU VÀO DB
  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role }),
    })

    if (!res.ok) {
      // cố gắng đọc message từ backend
      let msg = 'Đăng ký thất bại.'
      try {
        const data = await res.json()
        if (data?.message) msg = data.message
      } catch (_) {}
      throw new Error(msg)
    }

    // nếu backend trả token + user thì có thể dùng sau
    const data = await res.json().catch(() => null)
    if (data?.token) {
      localStorage.setItem(TOKEN_KEY, data.token)
    }
    // data.user (nếu có) có thể dùng để đồng bộ, nhưng không bắt buộc ở đây
  } catch (err) {
    console.warn('[AUTH] Backend /register lỗi, nhưng vẫn tiếp tục lưu local:', err)
    // ❗ không throw ở đây, để fallback local vẫn chạy
  }

  // 2. LOGIC CŨ – LƯU LOCALSTORAGE ĐỂ FE HOẠT ĐỘNG NHƯ TRƯỚC
  const list = users()
  if (!username.trim() || !email.trim() || !password)
    throw new Error('Vui lòng nhập đủ thông tin.')
  if (list.some(u => u.username.toLowerCase() === username.toLowerCase()))
    throw new Error('Tên người dùng đã tồn tại.')

  const passwordHash = await sha256(password)
  const user: User = { username, email, role, passwordHash, createdAt: Date.now() }
  list.push(user); saveUsers(list)
  log('AUTH_REGISTER', { username, role })

  // đăng nhập ngay sau khi đăng ký (giữ nguyên logic cũ)
  write<Session>(AUTH_SESSION, { username })

  return sanitize(user)
}

// ===================================================================
// 2) ĐĂNG NHẬP – THỬ BACKEND TRƯỚC, NẾU FAIL MỚI DÙNG LOCAL
// ===================================================================
export async function login(username: string, password: string) {
  // 1. THỬ LOGIN VỚI BACKEND (DB)
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (res.ok) {
      const data = await res.json()

      // Lưu token để sau này gọi các API cần auth
      if (data?.token) {
        localStorage.setItem(TOKEN_KEY, data.token)
      }

      const beUser = data?.user
      if (beUser?.username) {
        // Đồng bộ user backend vào localStorage nếu chưa có
        const list = users()
        let u = list.find(x => x.username === beUser.username)
        if (!u) {
          u = {
            username: beUser.username,
            email: beUser.email || '',
            role: (beUser.role as Role) || 'user',
            passwordHash: '',         // FE không cần hash DB
            createdAt: Date.now(),
          }
          list.push(u)
          saveUsers(list)
        }
        // Ghi session như cũ
        write<Session>(AUTH_SESSION, { username: beUser.username })
        log('AUTH_LOGIN', { username: beUser.username, via: 'backend' })
        return sanitize(u)
      }
    } else {
      // login fail từ backend → đọc thông báo nếu có
      let msg = 'Sai tên đăng nhập hoặc mật khẩu.'
      try {
        const data = await res.json()
        if (data?.message) msg = data.message
      } catch (_) {}
      throw new Error(msg)
    }
  } catch (err) {
    console.warn('[AUTH] Backend /login lỗi, thử dùng localStorage:', err)
    // ❗ không return, mà tiếp tục fallback logic cũ bên dưới
  }

  // 2. FALLBACK: LOGIC CŨ – KIỂM TRA LOCALSTORAGE
  const list = users()
  const u = list.find(x => x.username.toLowerCase() === username.toLowerCase())
  if (!u) throw new Error('Sai tên đăng nhập hoặc mật khẩu.')

  const hash = await sha256(password)
  if (u.passwordHash !== hash) throw new Error('Sai tên đăng nhập hoặc mật khẩu.')

  write<Session>(AUTH_SESSION, { username: u.username })
  log('AUTH_LOGIN', { username, via: 'local' })
  return sanitize(u)
}

// ===================================================================
// 3) ĐĂNG XUẤT – XÓA SESSION LOCAL + TOKEN BACKEND (NẾU CÓ)
// ===================================================================
export function logout() {
  // Xoá token backend nếu có
  localStorage.removeItem(TOKEN_KEY)

  // Giữ nguyên logic cũ
  write(AUTH_SESSION, null as any)
  log('AUTH_LOGOUT')
}

// ===================================================================
// 4) currentUser – GIỮ Y NGUYÊN (SYNC, DÙNG LOCAL CACHE)
// ===================================================================
export function currentUser(): (Omit<User, 'passwordHash'> | null) {
  const ses = read<Session | null>(AUTH_SESSION, null)
  if (!ses) return null
  const u = users().find(x => x.username === ses.username)
  return u ? sanitize(u) : null
}

// ===================================================================
// 5) hasRole – GIỮ Y NGUYÊN
// ===================================================================
export function hasRole(role: Role): boolean {
  const u = currentUser()
  return !!u && (u.role === role || (role === 'user' && !!u))
}

// ===================================================================
// 6) Tiện ích, giữ nguyên
// ===================================================================
function sanitize(u: User): Omit<User, 'passwordHash'> {
  const { passwordHash, ...safe } = u
  return safe
}

// tiện ích dev: tạo admin mặc định nếu chưa có (admin/admin)
export async function ensureDefaultAdmin() {
  const list = users()
  if (!list.some(u => u.role === 'admin')) {
    const passwordHash = await sha256('admin')
    list.push({
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      passwordHash,
      createdAt: Date.now(),
    })
    saveUsers(list)
  }
}
