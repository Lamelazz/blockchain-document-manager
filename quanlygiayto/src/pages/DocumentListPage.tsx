import React from 'react'
import { listDocuments, verifyDocument, softDelete, registerDocument } from '../services/contract'
import { Link } from 'react-router-dom'
import { currentUser } from '../services/auth'

export default function DocumentListPage() {
  const [q, setQ] = React.useState('')
  const [items, setItems] = React.useState<any[]>([])
  const user = currentUser()

  const load = React.useCallback(() => {
    listDocuments({ q }).then(setItems)
  }, [q])

  React.useEffect(() => { load() }, [load])

  // Tạo nhanh 1 bản ghi demo để bạn test UI
  const seedDemo = async () => {
    const id = 'DEMO-' + Math.random().toString(36).slice(2, 7).toUpperCase()
    await registerDocument(id, 'CCCD', 'DEMO_HASH_' + Date.now(), {
      note: 'Tài liệu mẫu để thử UI',
      tags: ['demo', 'sample']
    })
    load()
  }

  return (
    <div className="grid">
      {/* Toolbar cân đối */}
      <div className="toolbar">
        <input
          className="input grow"
          placeholder="Tìm theo mã/loại/hash..."
          value={q}
          onChange={e=>setQ(e.target.value)}
          onKeyDown={e=>{ if (e.key==='Enter') load() }}
        />
        <button className="btn ghost" onClick={load}>Tìm</button>
        <Link className="btn" to="/upload">+ Thêm mới</Link>
      </div>

      {/* Danh sách hoặc Empty state */}
      {items.length > 0 ? (
        <div className="list">
          {items.map(it => (
            <div className="item" key={it.id}>
              <div className="row" style={{ justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontWeight:700 }}>
                    <Link to={`/documents/${it.id}`}>{it.id}</Link>
                  </div>
                  <div className="badge">{it.type}</div>
                </div>

                {/* Chỉ admin được xác thực/xóa */}
                {user?.role === 'admin' && (
                  <div className="row">
                    <button className="btn ghost" onClick={()=>verifyDocument(it.id).then(load)}>
                      Đánh dấu xác thực
                    </button>
                    <button className="btn danger" onClick={()=>softDelete(it.id).then(load)}>
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-wrap">
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">
              {/* icon SVG nhẹ, không cần thêm ảnh */}
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="16" rx="3" stroke="#2563eb" strokeWidth="1.5" />
                <path d="M7 8h7M7 12h10M7 16h6" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h3 className="empty-title">Chưa có giấy tờ</h3>
              <p className="empty-sub">Hãy tải giấy tờ đầu tiên của bạn hoặc tạo một mục mẫu để xem giao diện danh sách.</p>
              <div className="empty-actions">
                <Link className="btn" to="/upload">+ Tải giấy tờ</Link>
                <button className="btn ghost" onClick={seedDemo}>Tạo dữ liệu mẫu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
