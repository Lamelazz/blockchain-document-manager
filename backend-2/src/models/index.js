const { sequelize } = require('../config/database')
const User = require('./User')
const Document = require('./Document')
const ShareAccess = require('./ShareAccess')
const AuditLog = require('./AuditLog')
const DocumentVersion = require('./DocumentVersion')
const Approval = require('./Approval')

// Định nghĩa quan hệ
Document.belongsTo(User, { foreignKey: 'owner', targetKey: 'username' })
User.hasMany(Document, { foreignKey: 'owner', sourceKey: 'username' })

Document.hasMany(DocumentVersion, { foreignKey: 'document_id' })
DocumentVersion.belongsTo(Document, { foreignKey: 'document_id' })

Document.hasMany(Approval, { foreignKey: 'document_id' })
Approval.belongsTo(Document, { foreignKey: 'document_id' })

Approval.belongsTo(User, { foreignKey: 'actor_id', as: 'actor' })
User.hasMany(Approval, { foreignKey: 'actor_id' })

Document.hasMany(ShareAccess, { foreignKey: 'documentId' })
ShareAccess.belongsTo(Document, { foreignKey: 'documentId' })

module.exports = {
  sequelize,
  User,
  Document,
  ShareAccess,
  AuditLog,
  DocumentVersion,
  Approval
}
