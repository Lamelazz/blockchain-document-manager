// controllers/adminController.js
const AuditLog = require('../models/AuditLog')

// UTILITY: Hàm được gọi bởi các controller khác để ghi log
exports.logAudit = async (action, username, detail = {}) => {
  try {
    await AuditLog.create({
      action,
      username,
      detail: detail
    })
  } catch (error) {
    console.error('Failed to write audit log:', error)
  }
}

// ENDPOINT: GET /api/admin/audit (cho AuditPage.tsx)
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      order: [['created_at', 'DESC']],
      limit: 100
    })

    const formattedLogs = logs.map(log => ({
      ts: new Date(log.created_at).getTime(), // new Date(x.ts).toLocaleString()
      action: log.action, // x.action
      detail: log.detail // x.detail
    }))

    res.json(formattedLogs)
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve audit logs' })
  }
}
