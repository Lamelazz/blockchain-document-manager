import React from 'react'
import { getDocument } from '../services/contract'
import { sha256File } from '../services/hash'

export default function SearchPage() {
  const [id, setId] = React.useState('')
  const [data, setData] = React.useState<any>(null) // [type, hash, owner, createdAtSec, verified]
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  // verify local file against found hash
  const [checkMsg, setCheckMsg] = React.useState<string | null>(null)
  const [checkState, setCheckState] = React.useState<'idle' | 'ok' | 'fail'>('idle')

  const onLookup = async () => {
    if (!id.trim()) { setError('Vui lòng nhập mã giấy tờ.'); setData(null); return }
    try {
      setLoading(true); setError(null); setData(null); setCheckState('idle'); setCheckMsg(null)
      const res = await getDocument(id.trim())
      setData(res)
    } catch (e: any) {
      setError(e.message || 'Không tìm thấy dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const onCheckFile = async (file: File) => {
    if (!data) return
    const hash = await sha256File(file)
    if (hash === data[1]) {
      setCheckState('ok')
      setCheckMsg('✅ File khớp mã SHA-256 đã lưu.')
    } else {
      setCheckState('fail')
      setCheckMsg('❌ File KHÔNG khớp mã SHA-256.')
    }
  }

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text)
  }

  return (
    <div className="search-wrap">
      {/* Thanh tìm kiếm cân giữa */}
      <div className="search-toolbar">
        <input
          className="input grow"
          placeholder="Nhập mã giấy tờ (ví dụ: số CCCD)…"
          value={id}
          onChange={e=>setId(e.target.value)}
          onKeyDown={e=>{ if (e.key==='Enter') onLookup() }}
        />
        <button className="btn" onClick={onLookup}>Tra cứu</button>
      </div>

      {loading && <div className="item">Đang tra cứu…</div>}
      {error && <div className="item" style={{borderColor:'#fecaca', background:'#fef2f2', color:'#7f1d1d'}}>{error}</div>}

      {data && (
        <div className="grid cols-2">
          {/* Cột trái: thông tin tổng quan */}
          <div className="item">
            <div className="row" style={{justifyContent:'space-between', alignItems:'start'}}>
              <div>
                <h3 style={{margin:'0 0 6px'}}>Mã: {id}</h3>
                <div className="badge" style={{marginRight:8}}>{data[0]}</div>
                <span className={`badge ${data[4] ? 'success' : 'warn'}`}>
                  {data[4] ? 'ĐÃ XÁC THỰC' : 'CHƯA XÁC THỰC'}
                </span>
              </div>
              <button className="btn ghost" onClick={()=>copy(String(id))}>Sao chép mã</button>
            </div>

            <div style={{marginTop:10}}>
              <div><b>Chủ sở hữu:</b> {data[2]}</div>
              <div><b>Thời gian:</b> {new Date(Number(data[3]) * 1000).toLocaleString()}</div>
            </div>
          </div>

          {/* Cột phải: hash + đối chiếu file */}
          <div className="item">
            <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
              <h3 style={{margin:0}}>Mã SHA-256</h3>
              <button className="btn ghost" onClick={()=>copy(data[1])}>Sao chép hash</button>
            </div>
            <div className="mono-box" style={{marginTop:8}}>{data[1]}</div>

            <div className={`file-verify ${checkState==='ok' ? 'ok' : checkState==='fail' ? 'fail' : ''}`} style={{marginTop:10}}>
              <div style={{fontWeight:600}}>Đối chiếu file</div>
              <div className="row">
                <input type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={e=>{ const f=e.target.files?.[0]; if (f) onCheckFile(f) }} />
                {checkMsg && <span>{checkMsg}</span>}
              </div>
              <div className="form-help">Chọn file trên máy, hệ thống sẽ tính SHA-256 và so với mã đã lưu.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
