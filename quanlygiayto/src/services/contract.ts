// =============================
// DOCUMENT SERVICE — DB ONLY 
// =============================

export type DocType =
  | "CCCD"
  | "CMND"
  | "HoChieu"
  | "BangLai"
  | "GiayKhaiSinh"
  | "Khac";

const API = "http://localhost:3000/api/documents";


// =============================
// AUTH HEADER
// =============================
function authHeaders() {
  const token = localStorage.getItem("auth_token");
  if (!token) console.warn("⚠ Không tìm thấy Token — FE sẽ bị 401!");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}


// =============================
// BASE REQUEST HANDLERS
// =============================
async function apiGet(url: string) {
  const res = await fetch(url, { headers: authHeaders() });
  let data = null;
  try { data = await res.json(); } catch {}

  if (!res.ok) throw new Error(data?.message || "Backend GET error");
  return data;
}

async function apiPost(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  let data = null;
  try { data = await res.json(); } catch {}

  if (!res.ok) throw new Error(data?.message || "Backend POST error");
  return data;
}

async function apiPut(url: string, body: any) {
  const res = await fetch(url, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  let data = null;
  try { data = await res.json(); } catch {}

  if (!res.ok) throw new Error(data?.message || "Backend PUT error");
  return data;
}

async function apiDelete(url: string) {
  const res = await fetch(url, {
    method: "DELETE",
    headers: authHeaders(),
  });

  let data = null;
  try { data = await res.json(); } catch {}

  if (!res.ok) throw new Error(data?.message || "Backend DELETE error");
  return data;
}



// ===================================================
// 1) REGISTER DOCUMENT
// ===================================================
export async function registerDocument(
  id: string,
  type: DocType,
  hash: string,
  extras: { note?: string; tags?: string[] } = {}
) {
  return await apiPost(API, {
    docId: id,
    type,
    hash,
    note: extras.note || "",
    tags: extras.tags || [],
  });
}



// ===================================================
// 2) UPDATE DOCUMENT
// ===================================================
export async function updateDocument(id: string, patch: any) {
  return await apiPut(`${API}/${id}`, patch);
}



// ===================================================
// 3) DELETE DOCUMENT
// ===================================================
export async function softDelete(id: string) {
  return await apiDelete(`${API}/${id}`);
}



// ===================================================
// 🔥 4) VERIFY DOCUMENT (Admin) — ĐÃ FIX ĐÚNG ROUTE
// ===================================================
export async function verifyDocument(id: string) {
  return await apiPut(`${API}/verify/${id}`, { verified: true });
}



// ===================================================
// 5) GET ONE DOCUMENT
// ===================================================
export async function getDocument(id: string) {
  const d = await apiGet(`${API}/${id}`);
  return [
    d.type,
    d.currentHash || d.hash,
    d.owner,
    Math.floor(new Date(d.createdAt).getTime() / 1000),
    !!d.verified,
  ];
}



// ===================================================
// 6) LIST DOCUMENTS
// ===================================================
export async function listDocuments(opts?: {
  q?: string;
  tags?: string[];
  includeDeleted?: boolean;
}) {
  let url = API;

  const params = new URLSearchParams();
  if (opts?.q) params.append("q", opts.q);
  if (opts?.includeDeleted) params.append("includeDeleted", "1");
  if (opts?.tags?.length) params.append("tags", opts.tags.join(","));

  if (params.toString()) url += `?${params}`;

  const docs = await apiGet(url);

  return docs.filter((d: any) => opts?.includeDeleted ? true : !d.isDeleted);
}
