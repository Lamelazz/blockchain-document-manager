const crypto = require('crypto')
const { body, validationResult } = require('express-validator')
const { Document, DocumentVersion, Approval, User } = require('../models')
const { uploadBase64 } = require('../services/ipfsService')

// ---- Validators ----
const createValidators = [
  body('title').isString().notEmpty().withMessage('Title is required'),
  body('category').optional().isString(),
  body('description').optional().isString()
]

const uploadValidators = [
  body('filename').isString().notEmpty().withMessage('Filename is required'),
  body('base64').isString().notEmpty().withMessage('Base64 content is required')
]

// ---- Helpers ----
function sha256Base64 (b64) {
  const buf = Buffer.from(b64, 'base64')
  const hash = crypto.createHash('sha256').update(buf).digest('hex')
  return hash
}

// ---- Controllers ----
async function listDocs (_req, res) {
  try {
    const docs = await Document.findAll({
      include: [
        { model: DocumentVersion },
        { model: Approval }
      ],
      where: { isDeleted: false }
    })
    return res.json(docs)
  } catch (error) {
    console.error('List documents error:', error)
    return res.status(500).json({ message: 'Failed to list documents' })
  }
}

async function createDoc (req, res) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    // req.user được set bởi middleware auth
    const owner = await User.findOne({ where: { username: req.user.username } })
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' })
    }

    const doc = await Document.create({
      ...req.body,
      owner: owner.username,
      owner_id: owner.id
    })

    return res.status(201).json(doc)
  } catch (error) {
    console.error('Create document error:', error)
    return res.status(500).json({ message: 'Failed to create document' })
  }
}

async function uploadVersion (req, res) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params
    const doc = await Document.findByPk(id)

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' })
    }

    const { filename, base64 } = req.body

    // Upload IPFS
    const up = await uploadBase64(filename, base64)
    const sha = sha256Base64(base64)

    // Lấy versionNo an toàn: đếm số version hiện có
    const currentCount = await DocumentVersion.count({
      where: { document_id: doc.id }
    })
    const verNo = currentCount + 1

    const tx = 'ipfs:' + up.cid

    const ver = await DocumentVersion.create({
      document_id: doc.id,
      versionNo: verNo,
      ipfsCid: up.cid,
      contentHash: sha,
      blockchainTx: tx
    })

    // Cập nhật doc hiện tại
    doc.ipfsCid = up.cid
    doc.currentHash = sha
    doc.blockchainTx = tx
    await doc.save()

    return res.json({
      document: doc,
      version: ver,
      gatewayUrl: up.gatewayUrl
    })
  } catch (error) {
    console.error('Upload version error:', error)
    return res.status(500).json({ message: 'Failed to upload version' })
  }
}

async function submitDoc (req, res) {
  try {
    const { id } = req.params
    const doc = await Document.findByPk(id)

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' })
    }

    doc.state = 'SUBMITTED'
    await doc.save()

    const actor = await User.findOne({ where: { username: req.user.username } })
    if (actor) {
      await Approval.create({
        document_id: doc.id,
        actor_id: actor.id,
        action: 'SUBMIT',
        comment: null
      })
    }

    return res.json(doc)
  } catch (error) {
    console.error('Submit document error:', error)
    return res.status(500).json({ message: 'Failed to submit document' })
  }
}

async function approveDoc (req, res) {
  try {
    const { id } = req.params
    const doc = await Document.findByPk(id)

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' })
    }

    doc.state = 'APPROVED'
    await doc.save()

    const actor = await User.findOne({ where: { username: req.user.username } })
    if (actor) {
      await Approval.create({
        document_id: doc.id,
        actor_id: actor.id,
        action: 'APPROVE',
        comment: (req.body && req.body.comment) || null
      })
    }

    return res.json(doc)
  } catch (error) {
    console.error('Approve document error:', error)
    return res.status(500).json({ message: 'Failed to approve document' })
  }
}

async function rejectDoc (req, res) {
  try {
    const { id } = req.params
    const doc = await Document.findByPk(id)

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' })
    }

    doc.state = 'REJECTED'
    await doc.save()

    const actor = await User.findOne({ where: { username: req.user.username } })
    if (actor) {
      await Approval.create({
        document_id: doc.id,
        actor_id: actor.id,
        action: 'REJECT',
        comment: (req.body && req.body.comment) || null
      })
    }

    return res.json(doc)
  } catch (error) {
    console.error('Reject document error:', error)
    return res.status(500).json({ message: 'Failed to reject document' })
  }
}

async function getDoc (req, res) {
  try {
    const { id } = req.params
    const doc = await Document.findByPk(id, {
      include: [DocumentVersion, Approval]
    })

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' })
    }

    return res.json(doc)
  } catch (error) {
    console.error('Get document error:', error)
    return res.status(500).json({ message: 'Failed to get document' })
  }
}

// ---- Exports ----
module.exports = {
  createValidators,
  uploadValidators,
  listDocs,
  createDoc,
  uploadVersion,
  submitDoc,
  approveDoc,
  rejectDoc,
  getDoc
}
