
import React from 'react'
import { read, write, KEYS, log } from '../services/storage'
import { listDocuments } from '../services/contract'

type ShareMap = Record<string, string[]> // docId -> list of viewers (emails)

export default function SharePage() {
  const [map, setMap] = React.useState<ShareMap>(read<ShareMap>(KEYS.SHARES, {}))
  const [docs, setDocs] = React.useState<any[]>([])

  React.useEffect(() => { listDocuments().then(setDocs) }, [])

  const save = (next: ShareMap) => { setMap(next); write(KEYS.SHARES, next); log('UPDATE_SHARING', next) }

  const addViewer = (docId: string, email: string) => {
    const next = { ...map }
    next[docId] = [...(next[docId] || []), email]
    save(next)
  }
  const removeViewer = (docId: string, email: string) => {
    const next = { ...map }
    next[docId] = (next[docId] || []).filter(x => x !== email)
    save(next)
  }

  return (
    <div className="grid">
      {docs.map(d => (
        <div className="item" key={d.id}>
          <div style={{fontWeight:700}}>{d.id} <span className="badge">{d.type}</span></div>
          <div className="row" style={{marginTop:8}}>
            <input id={`email-${d.id}`} className="input" placeholder="email người được xem" />
            <button className="btn" onClick={()=>{
              const el = document.getElementById(`email-${d.id}`) as HTMLInputElement
              const email = el.value.trim(); if (!email) return
              addViewer(d.id, email); el.value = ''
            }}>Thêm quyền xem</button>
          </div>
          <div style={{marginTop:8}}>
            {(map[d.id]||[]).length===0 && <div className="badge">Chưa chia sẻ</div>}
            {(map[d.id]||[]).map(v => (
              <div key={v} className="row" style={{justifyContent:'space-between'}}>
                <span>{v}</span>
                <button className="btn ghost" onClick={()=>removeViewer(d.id, v)}>Gỡ</button>
              </div>
            ))}
          </div>
        </div>
      ))}
      {docs.length===0 && <div className="item">Chưa có giấy tờ.</div>}
    </div>
  )
}
