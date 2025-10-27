const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const DocumentVersion = sequelize.define('DocumentVersion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  document_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'documents',
      key: 'id'
    }
  },
  versionNo: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ipfsCid: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contentHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  blockchainTx: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'document_versions',
  timestamps: true,
  underscored: true
})

module.exports = DocumentVersion
