import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { getDocument, updateDocument, listDocuments } from '../services/contract'

type DocumentItem = {
  id: string
  note?: string
  tags?: string[]
  owner?: string
  createdAt?: string
  verified?: boolean
  documentType?: string
  hash?: string
}

// ====================== ⚡ COMPONENT ======================
export default function DocumentDetailPage() {
  const { id } = useParams()

  const [data, setData] = React.useState<DocumentItem | null>(null)
  const [note, setNote] = React.useState("")
  const [tags, setTags] = React.useState("")
  const [toast, setToast] = React.useState<string | null>(null) // 🔥 thông báo UI

  // Hiện thông báo 2 giây rồi tự tắt
  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  // ====================== LOAD ======================
  const load = async () => {
    if (!id) return
    const all = await listDocuments({ includeDeleted: true }) as DocumentItem[]
    const d = all.find((x: DocumentItem) => x.id === id)

    setData(d || null)
    setNote(d?.note || "")
    setTags((d?.tags || []).join(", "))
  }

  React.useEffect(() => { load() }, [id])


  // ====================== SAVE ======================
  const onSave = async () => {
    if (!id) return
    try {
      await updateDocument(id, { 
        note, 
        tags: tags.split(",").map(s=>s.trim()).filter(Boolean) 
      })
      await load()
      showToast("Lưu thành công!")   // THÔNG BÁO THANH CÔNG
    } catch (err) {
      showToast("Không thể lưu!")
    }
  }

  if (!data) return <div>Không tìm thấy giấy tờ.</div>

  return (
    <div className="grid">

      {/* 🔥 Toast thông báo góc màn hình */}
      {toast && (
        <div style={{
          position:"fixed", top:20, right:20, padding:"10px 16px",
          background:"#16a34a", color:"#fff", borderRadius:8, zIndex:999,
          boxShadow:"0 4px 10px rgba(0,0,0,0.25)"
        }}>
          {toast}
        </div>
      )}

      {/* ============================ THÔNG TIN CHI TIẾT ============================ */}
      <div className="item">
        <div className="row" style={{justifyContent:'space-between'}}>
          <div>
            <h3>{data.id}</h3>
            <div className="badge">{data.documentType}</div>
          </div>
          <Link className="btn ghost" to="/documents">⬅ Quay lại</Link>
        </div>

        <p><b>Hash:</b> <span className="mono breakall">{data.hash}</span></p>
        <p><b>Chủ sở hữu:</b> {data.owner}</p>
        <p><b>Tạo lúc:</b> {new Date(data.createdAt || "").toLocaleString()}</p>
        <p><b>Trạng thái:</b> {data.verified ? "ĐÃ XÁC THỰC" : "CHƯA XÁC THỰC"}</p>
      </div>


      {/* ============================ GHI CHÚ & TAGS ============================ */}
      <div className="item">
        <h3>Ghi chú & Thẻ</h3>

        <textarea
          className="input"
          rows={4}
          placeholder="Ghi chú..."
          value={note}
          onChange={e=>setNote(e.target.value)}
        />

        <input
          className="input"
          placeholder="tags, phân, tách, bằng, dấu, phẩy"
          value={tags}
          onChange={e=>setTags(e.target.value)}
        />

        <div className="row" style={{marginTop:8}}>
          <button className="btn" onClick={onSave}>Lưu thay đổi</button>
        </div>
      </div>
    </div>
  )
}