import React from 'react'
import { read, KEYS } from '../services/storage'
import { currentUser } from '../services/auth'

export default function AuditPage() {
  const user = currentUser()
  const [items, setItems] = React.useState<any[]>([])
  React.useEffect(() => { setItems(read<any[]>(KEYS.AUDIT, [])) }, [])

  if (user?.role !== 'admin') {
    return <div className="item">🚫 Chỉ quản trị viên mới xem được nhật ký hoạt động.</div>
  }

  return (
    <div className="item">
      <table className="table">
        <thead>
          <tr><th>Thời gian</th><th>Hành động</th><th>Chi tiết</th></tr>
        </thead>
        <tbody>
          {items.map((x, i) => (
            <tr key={i}>
              <td>{new Date(x.ts).toLocaleString()}</td>
              <td>{x.action}</td>
              <td><code>{JSON.stringify(x.detail)}</code></td>
            </tr>
          ))}
          {items.length===0 && <tr><td colSpan={3}>Chưa có nhật ký.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
