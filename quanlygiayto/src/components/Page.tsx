import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { currentUser, logout } from '../services/auth'
import logo from '../assets/result.png'

type Props = { title?: string; children: React.ReactNode }
export function Page({ title, children }: Props) {
  const loc = useLocation()
  const nav = useNavigate()
  const user = currentUser()
  const isActive = (p: string) => (loc.pathname === p ? 'active' : '')
  const onLogout = () => { logout(); nav('/login') }

  return (
    <div className="container">
      <header className="site">
        {/* Brand (trái) */}
        <div className="brand">
          <img src={logo} alt="logo" style={{ width: 34, height: 34, borderRadius: 8 }} />
          <h1>{title || 'Ứng dụng'}</h1>
        </div>

        {/* Nav (giữa) */}
        <div className="nav-wrap">
          <div className="nav-links">
            <Link className={isActive('/')} to="/">Tổng quan</Link>
            <Link className={isActive('/upload')} to="/upload">Tải giấy tờ</Link>
            <Link className={isActive('/documents')} to="/documents">Danh sách</Link>
            <Link className={isActive('/search')} to="/search">Tra cứu</Link>
            <Link className={isActive('/share')} to="/share">Chia sẻ</Link>
            {/* Chỉ admin mới thấy Nhật ký */}
            {user?.role === 'admin' && (
              <Link className={isActive('/audit')} to="/audit">Nhật ký</Link>
            )}
          </div>
        </div>

        {/* Actions (phải) */}
        <div className="nav-actions">
          {!user ? (
            <Link className={isActive('/login')} to="/login">Đăng nhập/Đăng ký</Link>
          ) : (
            <span className="badge" title={`Vai trò: ${user.role}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {user.username} • {user.role === 'admin' ? 'Admin' : 'User'}
              <button className="btn ghost" onClick={onLogout}>Đăng xuất</button>
            </span>
          )}
        </div>
      </header>

      <div className="card">{children}</div>
      <footer></footer>
    </div>
  )
}
