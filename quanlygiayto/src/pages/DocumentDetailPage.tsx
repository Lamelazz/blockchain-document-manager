
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { getDocument, updateDocument, listDocuments } from '../services/contract'

export default function DocumentDetailPage() {
  const { id } = useParams()
  const [data, setData] = React.useState<any>(null)
  const [note, setNote] = React.useState('')
  const [tags, setTags] = React.useState('')

  const load = async () => {
    if (!id) return
    const all = await listDocuments({ includeDeleted: true })
    const d = all.find(x => x.id === id)
    setData(d)
    setNote(d?.note || '')
    setTags((d?.tags||[]).join(', '))
  }

  React.useEffect(() => { load() }, [id])

  const onSave = async () => {
    if (!id) return
    await updateDocument(id, { note, tags: tags.split(',').map(s=>s.trim()).filter(Boolean) })
    await load()
  }

  if (!data) return <div>Không tìm thấy giấy tờ.</div>

  return (
    <div className="grid">
      <div className="item">
        <div className="row" style={{justifyContent:'space-between'}}>
          <div>
            <h3>{data.id}</h3>
            <div className="badge">{data.type}</div>
          </div>
          <Link className="btn ghost" to="/documents">Quay lại</Link>
        </div>
        <p><b>Hash:</b> <span className="mono breakall">{data.hash}</span></p>
        <p><b>Chủ sở hữu:</b> {data.owner}</p>
        <p><b>Tạo lúc:</b> {new Date(data.createdAt).toLocaleString()}</p>
        <p><b>Trạng thái:</b> {data.verified ? 'ĐÃ XÁC THỰC' : 'CHƯA XÁC THỰC'}</p>
      </div>
      <div className="item">
        <h3>Ghi chú & Thẻ</h3>
        <textarea className="input" rows={4} placeholder="Ghi chú..." value={note} onChange={e=>setNote(e.target.value)} />
        <input className="input" placeholder="tags, phân, tách, bằng, dấu, phẩy" value={tags} onChange={e=>setTags(e.target.value)} />
        <div className="row" style={{marginTop:8}}>
          <button className="btn" onClick={onSave}>Lưu</button>
        </div>
      </div>
    </div>
  )
}
