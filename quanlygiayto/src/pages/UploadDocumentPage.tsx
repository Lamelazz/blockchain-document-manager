import React from "react";
import { sha256File } from "../services/hash";
import { currentUser } from "../services/auth";
import { getContract, connectWallet } from "../services/web3";

export default function UploadDocumentPage() {

  const user = currentUser();
  if (user?.role === "admin")
    return <div style={{padding:30,fontSize:18,color:"red"}}>Admin không thể upload tài liệu</div>;

  const [connected,setConnected] = React.useState(false);
  const [docId,setDocId] = React.useState("");
  const [docType,setDocType] = React.useState("CCCD");
  const [file,setFile] = React.useState<File|null>(null);
  const [note,setNote] = React.useState("");
  const [tags,setTags] = React.useState("");
  const [msg,setMsg] = React.useState("");
  const [uploaded,setUploaded] = React.useState<any>(null);

  const toBase64 = (file: File)=>new Promise<string>((resolve)=>{
    const r = new FileReader();
    r.onload=()=>resolve((r.result as string).split(",")[1]);
    r.readAsDataURL(file);
  });

  const connect = async ()=>{
    try{
      await connectWallet();
      setConnected(true);
      setMsg("🟢 Ví MetaMask đã kết nối");
    } catch(err:any){ setMsg(err.message); }
  };

  const onSubmit = async(e:React.FormEvent)=>{
    e.preventDefault();
    if(!connected) return setMsg("⚠ Chưa kết nối MetaMask!");
    if(!file || !docId) return setMsg("⚠ Thiếu file hoặc mã tài liệu!");

    try{
      setMsg("⏳ Đang xử lý...");

      const token = localStorage.getItem("auth_token") ?? "";
      const fileHash = await sha256File(file);

      // 1️⃣ Save metadata to DB
      const saved = await fetch("http://localhost:3000/api/documents",{
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body:JSON.stringify({ docId,type:docType,hash:fileHash,note,tags:tags.split(",").map(t=>t.trim()) })
      }).then(r=>r.json());
      if(!saved.id) throw new Error("Lưu DB thất bại");

      // 2️⃣ Upload → IPFS
      const base64 = await toBase64(file);
      const uploadedIPFS = await fetch(`http://localhost:3000/api/documents/${saved.id}/upload`,{
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body:JSON.stringify({ filename:file.name, base64 })
      }).then(r=>r.json());
      if(!uploadedIPFS.cid) throw new Error("Upload IPFS lỗi");

      // 3️⃣ Blockchain (MetaMask popup 🔥)
      const contract = await getContract();
      const tx = await contract.register("0x"+fileHash, uploadedIPFS.cid);
      await tx.wait();

      setUploaded({ cid:uploadedIPFS.cid, tx:tx.hash });
      setMsg("UPLOAD THÀNH CÔNG + BLOCKCHAIN GHI NHẬN!");

    }catch(err:any){ setMsg("❌ "+err.message); }
  };

  return (
    <div style={{maxWidth:650,margin:"40px auto",fontFamily:"sans-serif"}}>
      
      {/* HEADER */}
      <h2 style={{textAlign:"center",marginBottom:10}}>Upload Tài Liệu + Blockchain</h2>
      <p style={{textAlign:"center",opacity:0.7}}>Lưu trữ IPFS + Xác thực trên Smart Contract</p>

      {/* Connect Wallet */}
      <button onClick={connect}
        style={{
          width:"100%",padding:"12px",borderRadius:8,fontSize:17,fontWeight:600,
          background:connected?"#12c24a":"#ffb100",border:"none",cursor:"pointer",marginBottom:20
        }}
      >
        {connected?"🟢 Wallet Connected":" KẾT NỐI METAMASK"}
      </button>
      
      {/* FORM CARD */}
      <form onSubmit={onSubmit} 
        style={{padding:20,border:"2px solid #ddd",borderRadius:12,background:"#fafafa"}}>

        <label>Mã tài liệu</label>
        <input value={docId} onChange={e=>setDocId(e.target.value)}
          style={input}/>

        <label>Loại giấy tờ</label>
        <select value={docType} onChange={e=>setDocType(e.target.value)} style={input}>
          <option>CCCD</option><option>CMND</option><option>BangLai</option>
          <option>HoChieu</option><option>GiayKhaiSinh</option><option>Khac</option>
        </select>

        <label>Chọn file</label>
        <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} style={input}/>
        
        <label>Ghi chú</label>
        <textarea rows={3} value={note} onChange={e=>setNote(e.target.value)} style={input}/>

        <label>Tags (CMND, CCCD,...)</label>
        <input value={tags} onChange={e=>setTags(e.target.value)} style={input}/>

        <button type="submit"
          style={{
            width:"100%",marginTop:15,padding:"12px",borderRadius:8,fontSize:17,fontWeight:600,
            background:"#007bff",color:"#fff",border:"none",cursor:"pointer"
          }}>
          UPLOAD & GHI BLOCKCHAIN
        </button>
      </form>

      {/* Message */}
      {msg && <p style={{marginTop:15,textAlign:"center",fontWeight:600}}>{msg}</p>}

      {/* Upload Result */}
      {uploaded && (
        <div style={{
          marginTop:18,padding:14,borderRadius:10,border:"2px solid #00b4d8",
          background:"#e8f9ff",textAlign:"center"
        }}>
          <p><b>CID:</b> {uploaded.cid}</p>
          <p><b>TxHash:</b> {uploaded.tx}</p>
          <button 
            onClick={()=>window.open(`https://gateway.pinata.cloud/ipfs/${uploaded.cid}`)} 
            style={{marginTop:10,padding:"10px 15px",background:"#007bff",color:"#fff",borderRadius:6,border:"none"}}>
            📄 Xem tài liệu trên IPFS
          </button>
        </div>
      )}

    </div>
  );
}

/* Simple input style RE-USED */
const input = {
  width:"100%",padding:"9px 12px",marginBottom:12,
  border:"1px solid #bbb",borderRadius:6,fontSize:15
} as const;
