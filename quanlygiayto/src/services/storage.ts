
export const KEYS = {
  DOCS: 'pd_docs',
  AUDIT: 'pd_audit',
  SHARES: 'pd_shares',
  SETTINGS: 'pd_settings',
}

export function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch { return fallback }
}

export function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function log(action: string, detail?: any) {
  const logs = read<any[]>(KEYS.AUDIT, [])
  logs.unshift({ ts: Date.now(), action, detail })
  write(KEYS.AUDIT, logs.slice(0, 500))
}
