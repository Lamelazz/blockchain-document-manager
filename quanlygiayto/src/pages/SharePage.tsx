import React from "react";
import { listDocuments } from "../services/contract";
import { currentUser } from "../services/auth";

/* ================= API helpers ================= */
async function apiGetViewers(id: string) {
  const res = await fetch(`http://localhost:3000/api/documents/${id}/share/viewers`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("auth_token"),
    },
  });

  if (!res.ok) return []; // không crash UI
  return await res.json();
}

async function apiAddViewer(id: string, email: string) {
  const res = await fetch(`http://localhost:3000/api/documents/${id}/share/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("auth_token"),
    },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Share failed ❌");
}

async function apiRemoveViewer(id: string, email: string) {
  const res = await fetch(`http://localhost:3000/api/documents/${id}/share/remove`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("auth_token"),
    },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Remove failed ❌");
}


/* ================= UI ================= */
export default function SharePage() {
  const [docs, setDocs] = React.useState<any[]>([]);
  const [selected, setSelected] = React.useState<any>(null); // lưu luôn cả doc object
  const [emails, setEmails] = React.useState<string[]>([]);
  const [inputEmail, setInputEmail] = React.useState("");
  const [msg, setMsg] = React.useState<string>("");

  const user = currentUser();


  /* Load danh sách tài liệu của user */
  React.useEffect(() => {
    listDocuments().then((d: any[]) => {
      const owned = d.filter(doc => doc.owner === user?.username);
      setDocs(owned);
    });
  }, [user?.username]);


  const loadViewers = async (id: string) => {
    const doc = docs.find(d => d.id === id);
    setSelected(doc); // lưu full doc thay vì chỉ id
    setEmails(await apiGetViewers(id));
  };


  /* ================== ADD SHARE ================== */
  const add = async () => {
    if (!selected) return;
    if (!selected.verified) 
      return setMsg("Không thể chia sẻ — tài liệu CHƯA XÁC THỰC!");

    try {
      await apiAddViewer(selected.id, inputEmail);
      setMsg("Chia sẻ thành công");
      setInputEmail("");
      await loadViewers(selected.id);
    } catch(e:any){
      setMsg("❌"+e.message);
    }
  };

  /* ================== REMOVE SHARE ================== */
  const remove = async(email:string)=>{
    try{
      await apiRemoveViewer(selected.id, email);
      setMsg("Đã gỡ quyền");
      await loadViewers(selected.id);
    }catch(e:any){
      setMsg("❌ "+e.message);
    }
  };


  if(docs.length === 0)
    return <h2 style={{color:"red"}}>Bạn chưa có tài liệu để chia sẻ</h2>;


  return (
    <div className="grid">
      <h2>🔗 Chia sẻ tài liệu</h2>

      {/* chọn tài liệu */}
      <select className="input" onChange={e => loadViewers(e.target.value)} defaultValue="">
        <option value="" disabled>-- Chọn tài liệu --</option>
        {docs.map(d => (
          <option value={d.id} key={d.id}>
            {d.id} {d.verified ? "✔(Đã xác thực)" : "❗(Chưa xác thực)"}
          </option>
        ))}
      </select>

      {msg && <p style={{color:"red", marginTop:10}}>{msg}</p>}


      {selected && (
        <>
          <div style={{marginTop:10, fontWeight:"bold"}}>
            Trạng thái: {selected.verified ? "🟢 Đã xác thực" : "🔴 Chưa xác thực — KHÔNG THỂ SHARE"}
          </div>

          {/* Input email */}
          <div className="row" style={{marginTop:10}}>
            <input className="input"
              disabled={!selected.verified}
              value={inputEmail}
              placeholder="Nhập tài khoản người xem"
              onChange={e=>setInputEmail(e.target.value)}
            />
            <button className="btn" disabled={!selected.verified} onClick={add}>
              + Thêm quyền xem
            </button>
          </div>

          <h3 style={{marginTop:15}}>👁 Người được chia sẻ</h3>
          {emails.length === 0 && <div>Chưa chia sẻ cho ai.</div>}

          {emails.map(email => (
            <div key={email} className="row" style={{justifyContent:"space-between"}}>
              <span>{email}</span>
              <button className="btn ghost" onClick={()=>remove(email)}>Gỡ</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
