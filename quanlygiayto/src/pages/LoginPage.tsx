import React from 'react'
import { login, currentUser } from '../services/auth'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import loginHero from '../assets/organizer.png' 

export default function LoginPage() {
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPw, setShowPw] = React.useState(false)
  const [msg, setMsg] = React.useState('')
  const nav = useNavigate()
  const loc = useLocation() as any

  React.useEffect(() => {
    if (currentUser()) nav(loc.state?.redirect || '/', { replace: true })
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    if (!username.trim() || !password) {
      setMsg('Vui lòng nhập đủ tên đăng nhập và mật khẩu.')
      return
    }
    try {
      await login(username.trim(), password)
      nav(loc.state?.redirect || '/')
    } catch (e: any) {
      setMsg(e.message || 'Đăng nhập thất bại')
    }
  }

  return (
    <section className="auth">
      {/* Cột form */}
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <h3>Đăng nhập</h3>
        <p className="auth-sub">Truy cập kho giấy tờ cá nhân của bạn một cách an toàn.</p>

        <div className="space-y">
          <div className="row">
            <div className="input-group" style={{width:'100%'}}>
              <input
                className="input"
                placeholder="Tên đăng nhập"
                value={username}
                onChange={e=>setUsername(e.target.value)}
                aria-label="Tên đăng nhập"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="row">
            <div className="input-group" style={{width:'100%'}}>
              <input
                className="input"
                type={showPw ? 'text' : 'password'}
                placeholder="Mật khẩu"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                aria-label="Mật khẩu"
                autoComplete="current-password"
              />
              <button type="button" className="toggle" onClick={()=>setShowPw(s=>!s)}>
                {showPw ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
          </div>

          <div className="row" style={{marginTop:6}}>
            <button className="btn">Đăng nhập</button>
            <Link className="btn ghost" to="/register">Tạo tài khoản</Link>
          </div>

          {msg && <div className="form-error">{msg}</div>}
        </div>
      </form>

      {/* Cột ảnh */}
      <div className="auth-img" aria-hidden="true">
        <img src={loginHero} alt="" />
      </div>
    </section>
  )
}
