import React from 'react'
import { register } from '../services/auth'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import registerHero from '../assets/candidatespic.png'

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export default function RegisterPage() {
  const [username, setUsername] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPw, setShowPw] = React.useState(false)
  const [msg, setMsg] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const nav = useNavigate()
  const [sp] = useSearchParams()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')

    if (!username.trim()) return setMsg('Vui lòng nhập tên đăng nhập.')
    if (!email.trim() || !isEmail(email)) return setMsg('Email không hợp lệ.')
    if (!password || password.length < 6) return setMsg('Mật khẩu tối thiểu 6 ký tự.')

    try {
      setLoading(true)
      // tất cả tài khoản mới mặc định role = 'user'
      await register({ username: username.trim(), email: email.trim(), password, role: 'user' })
      const redirect = sp.get('redirect') || '/'
      nav(redirect)
    } catch (e: any) {
      setMsg(e.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth">
      {/* Cột form */}
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <h3>Đăng ký tài khoản</h3>
        <p className="auth-sub">Tạo tài khoản để quản lý mọi giấy tờ của bạn dễ dàng và an toàn.</p>

        <div className="space-y">
          <div className="row">
            <input
              className="input"
              placeholder="Tên đăng nhập"
              value={username}
              onChange={e=>setUsername(e.target.value)}
              autoComplete="username"
              aria-label="Tên đăng nhập"
            />
          </div>

          <div className="row">
            <input
              className="input"
              placeholder="Email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              autoComplete="email"
              aria-label="Email"
            />
          </div>

          <div className="row">
            <div className="input-group" style={{width:'100%'}}>
              <input
                className="input"
                type={showPw ? 'text' : 'password'}
                placeholder="Mật khẩu (≥ 6 ký tự)"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                autoComplete="new-password"
                aria-label="Mật khẩu"
              />
              <button type="button" className="toggle" onClick={()=>setShowPw(s=>!s)}>
                {showPw ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
          </div>

          <div className="row" style={{marginTop:6}}>
            <button className="btn" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Đăng ký & đăng nhập'}
            </button>
            <Link className="btn ghost" to="/login">Đã có tài khoản? Đăng nhập</Link>
          </div>

          {msg && <div className="form-error">{msg}</div>}
        </div>
      </form>

      {/* Cột ảnh */}
      <div className="auth-img" aria-hidden="true">
        <img src={registerHero} alt="" />
      </div>
    </section>
  )
}
