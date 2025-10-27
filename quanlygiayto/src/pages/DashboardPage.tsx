import React from 'react'
import { listDocuments } from '@/services/contract'
import { Link } from 'react-router-dom'
import hero from '../assets/voterpic.png'

export default function DashboardPage() {
  const [stats, setStats] = React.useState({ total: 0, verified: 0, unverified: 0 })
  const [recent, setRecent] = React.useState<any[]>([])

  React.useEffect(() => {
    listDocuments({ includeDeleted: false }).then(list => {
      const verified = list.filter(x => x.verified).length
      setStats({ total: list.length, verified, unverified: list.length - verified })
      setRecent(list.slice(0, 5))
    })
  }, [])

  return (
    <div className="grid">
      <section className="hero">
        <div>
          <h2>Quản lý giấy tờ cá nhân – tiện lợi, bảo mật và thông minh</h2>
          <p>
            Lưu trữ an toàn – Xác thực nhanh bằng mã SHA-256 – Tìm kiếm và chia sẻ linh hoạt.
            Ứng dụng giúp bạn làm chủ mọi giấy tờ chỉ trong vài cú nhấp chuột.
          </p>
          <div className="row" style={{marginTop:14}}>
            <Link className="btn" to="/upload">+ Tải giấy tờ</Link>
            <Link className="btn ghost" to="/documents">Xem danh sách</Link>
          </div>
        </div>
        <img src={hero} alt="Quản lý giấy tờ" />
      </section>

      <div className="grid cols-3">
        <div className="item">
          <div className="badge">Tổng số giấy tờ</div>
          <h2 style={{margin:'8px 0 0'}}>{stats.total}</h2>
        </div>
        <div className="item">
          <div className="badge">Đã xác thực</div>
          <h2 style={{margin:'8px 0 0'}}>{stats.verified}</h2>
        </div>
        <div className="item">
          <div className="badge">Chưa xác thực</div>
          <h2 style={{margin:'8px 0 0'}}>{stats.unverified}</h2>
        </div>
      </div>

      <div className="item">
        <div className="row" style={{justifyContent:'space-between'}}>
          <h3>Gần đây</h3>
          <Link className="btn ghost" to="/documents">Xem tất cả</Link>
        </div>
        <table className="table">
          <thead><tr><th>Mã</th><th>Loại</th><th>Trạng thái</th><th>Thời gian</th></tr></thead>
          <tbody>
            {recent.map(r => (
              <tr key={r.id}>
                <td><Link to={`/documents/${r.id}`}>{r.id}</Link></td>
                <td>{r.type}</td>
                <td>{r.verified ? 'ĐÃ XÁC THỰC' : 'CHƯA XÁC THỰC'}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan={4}>Chưa có dữ liệu. Hãy <a href="/upload">tải giấy tờ</a>.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
