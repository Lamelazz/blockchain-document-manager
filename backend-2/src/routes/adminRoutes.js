// routes/adminRoutes.js
const express = require('express')
const router = express.Router()
const { requireAuth, requireAdmin } = require('../middlewares/auth')
const adminController = require('../controllers/adminController')

// GET /api/admin/audit (AuditPage.tsx)
router.get('/audit', requireAuth, requireAdmin, adminController.getAuditLogs)

module.exports = router
