
import React from 'react'
import { read, write, KEYS, log } from '../services/storage'

export default function SettingsPage() {
  const [settings, setSettings] = React.useState<any>(read(KEYS.SETTINGS, { theme: 'dark' }))

  const onExport = () => {
    const dump = {
      docs: read(KEYS.DOCS, []),
      shares: read(KEYS.SHARES, {}),
      audit: read(KEYS.AUDIT, []),
      settings
    }
    const blob = new Blob([JSON.stringify(dump, null, 2)], {type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'personal-docs-export.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const onImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result))
        write(KEYS.DOCS, data.docs||[])
        write(KEYS.SHARES, data.shares||{})
        write(KEYS.AUDIT, data.audit||[])
        write(KEYS.SETTINGS, data.settings||settings)
        log('IMPORT_DATA')
        alert('Đã nhập dữ liệu xong.')
      } catch (e) {
        alert('File không hợp lệ')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="grid">
      <div className="item">
        <h3>Giao diện</h3>
        <div className="row">
          <select className="input" value={settings.theme} onChange={e=>{ const s={...settings, theme:e.target.value}; setSettings(s); write(KEYS.SETTINGS, s); }}>
            <option value="dark">Tối</option>
            <option value="light">Sáng</option>
          </select>
          <span className="badge">Chỉ áp dụng trong FE demo</span>
        </div>
      </div>
      <div className="item">
        <h3>Sao lưu</h3>
        <div className="row">
          <button className="btn" onClick={onExport}>Xuất JSON</button>
          <label className="btn ghost">
            Nhập JSON
            <input type="file" accept="application/json" style={{display:'none'}} onChange={e=>{ const f=e.target.files?.[0]; if (f) onImport(f) }} />
          </label>
        </div>
      </div>
    </div>
  )
}
