// middleware/role.js
// Mục đích: Đảm bảo người dùng có vai trò 'admin' để truy cập các tài nguyên nhạy cảm.
// Được sử dụng cho AuditPage.tsx

exports.requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({ message: 'Admin access required' })
  }
}
