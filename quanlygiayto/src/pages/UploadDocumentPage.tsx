import React from 'react'
import { registerDocument, DocType } from '../services/contract'
import { sha256File } from '../services/hash'
import { currentUser } from '../services/auth'

export default function UploadDocumentPage() {
  const user = currentUser()
  // Chỉ cho user thường được upload
  if (user?.role === 'admin') {
    return <div className="item">🚫 Chức năng này chỉ dành cho người dùng thông thường.</div>
  }

  const [docId, setDocId] = React.useState('')
  const [docType, setDocType] = React.useState<DocType>('CCCD')
  const [file, setFile] = React.useState<File | null>(null)
  const [note, setNote] = React.useState('')
  const [tags, setTags] = React.useState<string>('')
  const [hash, setHash] = React.useState('')
  const [msg, setMsg] = React.useState('')

  const onPickFile = (f: File | null) => { setFile(f); setHash(''); if (f) setMsg(`Đã chọn: ${f.name}`) }
  const onHash = async () => { if (!file) return setMsg('Hãy chọn tệp trước.'); const h = await sha256File(file); setHash(h); setMsg('Đã tính SHA-256.') }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setMsg('')
      if (!docId.trim() || !file) { setMsg('Vui lòng nhập Mã giấy tờ và chọn File.'); return }
      const h = hash || await sha256File(file)
      await registerDocument(
        docId.trim(),
        docType,
        h,
        { note, tags: tags.split(',').map(s => s.trim()).filter(Boolean) }
      )
      setMsg('✅ Đã lưu giấy tờ vào kho cục bộ.')
      setDocId(''); setDocType('CCCD'); setFile(null); setNote(''); setTags(''); setHash('')
    } catch (e: any) {
      setMsg(e.message || 'Có lỗi xảy ra')
    }
  }

  return (
    <form className="upload" onSubmit={onSubmit}>
      {/* Cột trái: Thông tin & file */}
      <div className="upload-card">
        <div className="row">
          <input
            className="input"
            placeholder="Mã giấy tờ (ví dụ: số CCCD)"
            value={docId}
            onChange={e=>setDocId(e.target.value)}
          />
          <select
            className="input"
            value={docType}
            onChange={e=>setDocType(e.target.value as DocType)}
          >
            <option value="CCCD">CCCD</option>
            <option value="CMND">CMND</option>
            <option value="HoChieu">Hộ chiếu</option>
            <option value="BangLai">Bằng lái</option>
            <option value="GiayKhaiSinh">Giấy khai sinh</option>
            <option value="Khac">Khác</option>
          </select>
        </div>

        <div className="file-row" style={{ marginTop: 10 }}>
          <input type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={e=>onPickFile(e.target.files?.[0] || null)} />
          <button type="button" className="btn ghost" onClick={onHash}>Tính SHA-256</button>
          {file && <span className="file-chip" title={file.name}>{file.name}</span>}
        </div>

        {hash && <div className="hash-box">SHA-256: {hash}</div>}
      </div>

      {/* Cột phải: Ghi chú/Tags + Lưu */}
      <div className="upload-card">
        <textarea
          className="input"
          placeholder="Ghi chú"
          value={note}
          onChange={e=>setNote(e.target.value)}
          rows={4}
        />
        <input
          className="input"
          style={{ marginTop: 10 }}
          placeholder="Tags (phân tách bằng dấu phẩy)"
          value={tags}
          onChange={e=>setTags(e.target.value)}
        />
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn">Lưu giấy tờ</button>
        </div>
        {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
      </div>
    </form>
  )
}
