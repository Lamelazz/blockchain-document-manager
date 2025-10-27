const express = require('express')
const router = express.Router()
const { requireAuth, requireAdmin } = require('../middlewares/auth') // SỬA: middleware không có 's'
const docController = require('../controllers/documentController')
const shareController = require('../controllers/shareController')

// Quản lý tài liệu
router.get('/', requireAuth, docController.listDocs)
router.post('/', requireAuth, docController.createValidators, docController.createDoc)
router.post('/:id/upload', requireAuth, docController.uploadValidators, docController.uploadVersion)
router.get('/:id', requireAuth, docController.getDoc)

// Workflow approval
router.post('/:id/submit', requireAuth, docController.submitDoc)
router.post('/:id/approve', requireAuth, requireAdmin, docController.approveDoc)
router.post('/:id/reject', requireAuth, requireAdmin, docController.rejectDoc)

// Chia sẻ
router.get('/:id/share/viewers', requireAuth, shareController.getViewers)
router.post('/:id/share/add', requireAuth, shareController.addViewer)
router.post('/:id/share/remove', requireAuth, shareController.removeViewer)

module.exports = router
