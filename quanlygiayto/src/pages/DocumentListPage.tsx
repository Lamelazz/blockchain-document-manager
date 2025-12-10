import React from 'react'
import { listDocuments, verifyDocument, softDelete, registerDocument } from '../services/contract'
import { Link } from 'react-router-dom'
import { currentUser } from '../services/auth'


/*================ BADGE =================*/
function StatusBadge({ verified, state }:any) {
  const b={padding:"4px 8px",borderRadius:5,color:"#fff",fontSize:12,fontWeight:600}
  if(verified) return <span style={{...b,background:"#16a34a"}}>Đã xác thực</span>
  if(state==="SUBMITTED") return <span style={{...b,background:"#fbbf24",color:"#000"}}>Chờ duyệt</span>
  if(state==="REJECTED") return <span style={{...b,background:"#dc2626"}}>Bị từ chối</span>
  return <span style={{...b,background:"#6b7280"}}>Nháp</span>
}


/*================ API: lấy danh sách share =================*/
async function getSharedDocs(): Promise<string[]> {
  const token = localStorage.getItem("auth_token")
  const res = await fetch("http://localhost:3000/api/documents/shared/list",{
    headers:{ Authorization:"Bearer "+token }
  })
  return res.ok ? await res.json() : []
}


/*================ MAIN =================*/
export default function DocumentListPage(){

  const [q,setQ]=React.useState("")
  const [items,setItems]=React.useState<any[]>([])
  const [shared,setShared]=React.useState<string[]>([])
  const user=currentUser()

  const load = React.useCallback(()=>{
  listDocuments({q}).then(docs=>{
    
    // thêm logic lọc theo từ khóa tìm kiếm
    const key = q.toLowerCase().trim();

    const filtered = docs.filter((d:any)=>
      d.id.toLowerCase().includes(key) ||           // Tìm theo Mã tài liệu
      d.owner.toLowerCase().includes(key) ||        // Tìm theo tên chủ sở hữu
      d.documentType?.toLowerCase().includes(key)   // Tìm theo loại tài liệu
    );

    setItems(filtered)
  })

  getSharedDocs().then(setShared)

},[q])


  React.useEffect(()=>{ load() },[load])


  return (
<div style={{padding:22}}>

  <h2 style={{marginBottom:18,fontSize:26,fontWeight:700}}>📄 Danh sách tài liệu</h2>

  {/*============== SEARCH ==============*/}
  <div style={{display:"flex",gap:8,marginBottom:20}}>
    <input style={{padding:"9px 12px",borderRadius:6,border:"1px solid #ccc",flex:1}}
      placeholder="Tìm theo mã,tên chủ sở hữu,loại tài liệu,..."
      value={q}
      onChange={e=>setQ(e.target.value)}
      onKeyDown={e=>e.key==="Enter"&&load()}
    />
    <button onClick={load} style={{padding:"9px 14px",borderRadius:6}}>Tìm</button>
    <Link to="/upload" style={{padding:"9px 14px",background:"#2563eb",color:"#fff",borderRadius:6}}>+ Upload</Link>
  </div>



  {/*============== LIST ==============*/}
  <div style={{
    display:"grid",
    gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",
    gap:18
  }}>

  {items.map(it=>{
    
    const isOwner    = it.owner===user?.username
    const canOpen    = isOwner || shared.includes(it.id)   // ⭐ chỉ quyền truy cập FILE
    const canSeeInfo = true                                // ⭐ ai cũng xem được info

    return (
      <div key={it.id} style={{
        padding:18,
        background:"#fff",
        borderRadius:14,
        boxShadow:"0 4px 14px rgba(0,0,0,.08)"
      }}>

        {/* ALWAYS CLICKABLE → xem chi tiết */}
        <Link to={`/documents/${it.id}`} style={{fontSize:20,fontWeight:700,color:"#1d4ed8"}}>
          {it.id}
        </Link>

        <div style={{fontSize:14,opacity:.8}}>Chủ sở hữu: <b>{it.owner}</b></div>
        <div style={{marginTop:6}}><StatusBadge verified={it.verified} state={it.state}/></div>


        {/*================ VIEW CONTROL =================*/}
        {canOpen && it.ipfsCid && (
          <a href={`https://gateway.pinata.cloud/ipfs/${it.ipfsCid}`}
             target="_blank" rel="noreferrer"
             style={{
              marginTop:12,display:"inline-block",
              padding:"9px 12px",background:"#007bff",
              color:"#fff",borderRadius:6,fontWeight:600
             }}>
             Mở tài liệu (IPFS)
          </a>
        )}

        {!canOpen && (
          <div style={{marginTop:12,color:"#888",fontSize:14}}>
             Bạn vẫn xem được chi tiết →  
            <Link to={`/documents/${it.id}`} style={{color:"#2563eb"}}> mở</Link>
          </div>
        )}


        {/*================ ADMIN =================*/}
        {user?.role==="admin" && (
          <div style={{display:"flex",gap:8,marginTop:12}}>

            {!it.verified && (
              <button style={{
                flex:1,padding:"8px",background:"#16a34a",
                color:"#fff",borderRadius:6,fontWeight:600
              }} onClick={()=>verifyDocument(it.id).then(load)}>
                Xác thực
              </button>
            )}

            <button style={{
              flex:1,padding:"8px",background:"#dc2626",
              color:"#fff",borderRadius:6,fontWeight:600
            }} onClick={()=>softDelete(it.id).then(load)}>
              Xóa
            </button>

          </div>
        )}

      </div>
    )
  })}

  </div>

</div>
  )
}
