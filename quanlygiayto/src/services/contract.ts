
import { read, write, KEYS, log } from './storage'

export type DocType = 'CCCD' | 'CMND' | 'HoChieu' | 'BangLai' | 'GiayKhaiSinh' | 'Khac'

export type DocRecord = {
  id: string
  type: DocType
  hash: string
  owner: string
  createdAt: number
  verified: boolean
  note?: string
  tags?: string[]
  deleted?: boolean
}

function getAll(): DocRecord[] { return read<DocRecord[]>(KEYS.DOCS, []) }
function saveAll(list: DocRecord[]) { write(KEYS.DOCS, list) }

export async function registerDocument(id: string, type: DocType, hash: string, extras: Partial<DocRecord> = {}) {
  const list = getAll()
  const exists = list.find(d => d.id === id)
  if (exists) throw new Error('ID đã tồn tại trong kho cục bộ')
  const rec: DocRecord = {
    id, type, hash,
    owner: 'me',
    createdAt: Date.now(),
    verified: false,
    note: extras.note,
    tags: extras.tags || []
  }
  list.unshift(rec)
  saveAll(list)
  log('ADD_DOCUMENT', { id, type })
  return rec
}

export async function updateDocument(id: string, patch: Partial<DocRecord>) {
  const list = getAll()
  const idx = list.findIndex(d => d.id === id)
  if (idx < 0) throw new Error('Không tìm thấy tài liệu')
  list[idx] = { ...list[idx], ...patch }
  saveAll(list)
  log('UPDATE_DOCUMENT', { id, patch })
  return list[idx]
}

export async function softDelete(id: string) {
  return updateDocument(id, { deleted: true })
}

export async function restore(id: string) {
  return updateDocument(id, { deleted: false })
}

export async function verifyDocument(id: string) {
  return updateDocument(id, { verified: true })
}

export async function getDocument(id: string) {
  const d = getAll().find(x => x.id === id)
  if (!d) throw new Error('Không có dữ liệu')
  // giữ định dạng tương thích trang cũ: [type, hash, owner, createdAtSeconds, verified]
  return [d.type, d.hash, d.owner, Math.floor(d.createdAt/1000), d.verified]
}

export async function listDocuments(opts?: { includeDeleted?: boolean; q?: string; tags?: string[] }) {
  let list = getAll()
  if (!opts?.includeDeleted) list = list.filter(d => !d.deleted)
  if (opts?.q) {
    const s = opts.q.toLowerCase()
    list = list.filter(d => d.id.toLowerCase().includes(s) || d.type.toLowerCase().includes(s) || d.hash.includes(s) || (d.note||'').toLowerCase().includes(s))
  }
  if (opts?.tags?.length) {
    list = list.filter(d => (d.tags||[]).some(t => opts.tags!.includes(t)))
  }
  return list
}
