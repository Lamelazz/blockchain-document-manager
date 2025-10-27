import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Page } from '../components/Page'
import DashboardPage from '../pages/DashboardPage'
import UploadDocumentPage from '../pages/UploadDocumentPage'
import DocumentListPage from '../pages/DocumentListPage'
import DocumentDetailPage from '../pages/DocumentDetailPage'
import SearchPage from '../pages/SearchPage'
import SharePage from '../pages/SharePage'
import AuditPage from '../pages/AuditPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import { RequireAuth, RequireRole } from '../components/Guard'
import { ensureDefaultAdmin } from '../services/auth'

export default function App() {
  React.useEffect(() => { ensureDefaultAdmin() }, [])

  return (
    <Routes>
      <Route path="/" element={<Page title="Tổng quan"><DashboardPage/></Page>} />
      <Route path="/login" element={<Page title="Đăng nhập"><LoginPage/></Page>} />
      <Route path="/register" element={<Page title="Đăng ký"><RegisterPage/></Page>} />

      {/* cần đăng nhập */}
      <Route path="/upload" element={<Page title="Tải giấy tờ"><RequireAuth><UploadDocumentPage/></RequireAuth></Page>} />
      <Route path="/documents" element={<Page title="Danh sách giấy tờ"><RequireAuth><DocumentListPage/></RequireAuth></Page>} />
      <Route path="/documents/:id" element={<Page title="Chi tiết giấy tờ"><RequireAuth><DocumentDetailPage/></RequireAuth></Page>} />
      <Route path="/search" element={<Page title="Tra cứu & xác thực"><RequireAuth><SearchPage/></RequireAuth></Page>} />
      <Route path="/share" element={<Page title="Chia sẻ & quyền xem"><RequireAuth><SharePage/></RequireAuth></Page>} />

      {/* admin-only */}
      <Route path="/audit" element={<Page title="Nhật ký hoạt động"><RequireRole role="admin"><AuditPage/></RequireRole></Page>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
