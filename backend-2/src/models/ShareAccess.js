const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const ShareAccess = sequelize.define('ShareAccess', {
  documentId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'document_id',
    references: {
      model: 'documents',
      key: 'id'
    }
  },
  viewerEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'viewer_email'
  }
}, {
  tableName: 'document_shares',
  timestamps: true,
  underscored: true,
  indexes: [
    { unique: true, name: 'document_shares_document_id_viewer_email', fields: ['document_id', 'viewer_email'] }
  ]
})

module.exports = ShareAccess
