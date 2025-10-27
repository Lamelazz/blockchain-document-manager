// controllers/shareController.js
const ShareAccess = require('../models/ShareAccess')
const Document = require('../models/Document')
const { logAudit } = require('./adminController')

exports.addViewer = async (req, res) => {
  const { id } = req.params
  const { email } = req.body

  const doc = await Document.findByPk(id)
  if (!doc || doc.owner !== req.user.username) {
    return res.status(403).json({ message: 'Access denied: Only owner can share' })
  }

  try {
    const newShare = await ShareAccess.create({ documentId: id, viewerEmail: email })
    logAudit('SHARE_DOC_ADD', req.user.username, { docId: id, email })
    res.status(201).json(newShare)
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Viewer already added' })
    }
    res.status(500).json({ message: 'Failed to add viewer', error: error.message })
  }
}

exports.removeViewer = async (req, res) => {
  const { id } = req.params
  const { email } = req.body

  const doc = await Document.findByPk(id)
  if (!doc || doc.owner !== req.user.username) {
    return res.status(403).json({ message: 'Access denied: Only owner can modify sharing' })
  }
  await ShareAccess.destroy({ where: { documentId: id, viewerEmail: email } })

  logAudit('SHARE_DOC_REMOVE', req.user.username, { docId: id, email })
  res.status(204).send()
}

exports.getViewers = async (req, res) => {
  const { id } = req.params

  const doc = await Document.findByPk(id)
  if (!doc || doc.owner !== req.user.username) {
    return res.status(403).json({ message: 'Access denied' })
  }

  const shares = await ShareAccess.findAll({ where: { documentId: id } })
  const emails = shares.map(s => s.viewerEmail)
  res.json(emails)
}
