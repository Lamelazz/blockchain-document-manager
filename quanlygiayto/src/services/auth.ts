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

function users(): User[] { return read<User[]>(AUTH_USERS, []) }
function saveUsers(list: User[]) { write(AUTH_USERS, list) }

async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('')
}

export async function register(params: {username: string; email: string; password: string; role?: Role}) {
  const { username, email, password } = params
  const role: Role = params.role || 'user'
  const list = users()
  if (!username.trim() || !email.trim() || !password) throw new Error('Vui lòng nhập đủ thông tin.')
  if (list.some(u => u.username.toLowerCase() === username.toLowerCase())) throw new Error('Tên người dùng đã tồn tại.')
  const passwordHash = await sha256(password)
  const user: User = { username, email, role, passwordHash, createdAt: Date.now() }
  list.push(user); saveUsers(list)
  log('AUTH_REGISTER', { username, role })
  // đăng nhập ngay sau khi đăng ký
  write<Session>(AUTH_SESSION, { username })
  return sanitize(user)
}

export async function login(username: string, password: string) {
  const list = users()
  const u = list.find(x => x.username.toLowerCase() === username.toLowerCase())
  if (!u) throw new Error('Sai tên đăng nhập hoặc mật khẩu.')
  const hash = await sha256(password)
  if (u.passwordHash !== hash) throw new Error('Sai tên đăng nhập hoặc mật khẩu.')
  write<Session>(AUTH_SESSION, { username: u.username })
  log('AUTH_LOGIN', { username })
  return sanitize(u)
}

export function logout() {
  write(AUTH_SESSION, null as any)
  log('AUTH_LOGOUT')
}

export function currentUser(): (Omit<User,'passwordHash'> | null) {
  const ses = read<Session | null>(AUTH_SESSION, null)
  if (!ses) return null
  const u = users().find(x => x.username === ses.username)
  return u ? sanitize(u) : null
}

export function hasRole(role: Role): boolean {
  const u = currentUser()
  return !!u && (u.role === role || (role === 'user' && !!u))
}

function sanitize(u: User): Omit<User,'passwordHash'> {
  const { passwordHash, ...safe } = u
  return safe
}

// tiện ích dev: tạo admin mặc định nếu chưa có (admin/admin)
export async function ensureDefaultAdmin() {
  const list = users()
  if (!list.some(u => u.role === 'admin')) {
    const passwordHash = await sha256('admin')
    list.push({ username: 'admin', email: 'admin@example.com', role: 'admin', passwordHash, createdAt: Date.now() })
    saveUsers(list)
  }
}
