// const { DataTypes } = require('sequelize')
// const { sequelize } = require('../config/database')

// const Document = sequelize.define('Document', {
//   id: {
//     type: DataTypes.STRING,
//     primaryKey: true,
//     unique: true,
//     allowNull: false,
//     defaultValue: () => `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
//   },
//   title: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   category: {
//     type: DataTypes.STRING
//   },
//   description: {
//     type: DataTypes.TEXT
//   },
//   documentType: {
//     type: DataTypes.STRING
//   },
//   fileMimeType: {
//     type: DataTypes.STRING
//   },
//   ipfsCid: {
//     type: DataTypes.STRING
//   },
//   currentHash: {
//     type: DataTypes.STRING
//   },
//   blockchainTx: {
//     type: DataTypes.STRING
//   },
//   note: {
//     type: DataTypes.TEXT
//   },
//   tags: {
//     type: DataTypes.ARRAY(DataTypes.STRING),
//     defaultValue: []
//   },
//   verified: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false,
//     allowNull: false
//   },
//   isDeleted: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false,
//     allowNull: false
//   },
//   state: {
//     type: DataTypes.ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'),
//     defaultValue: 'DRAFT',
//     allowNull: false
//   },
//   owner: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     references: {
//       model: 'app_users',
//       key: 'username'
//     }
//   },
//   owner_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'app_users',
//       key: 'id'
//     }
//   }
// }, {
//   tableName: 'documents',
//   timestamps: true,
//   underscored: true,
//   indexes: [
//     { fields: ['ipfsCid'] },
//     { fields: ['owner'] },
//     { fields: ['documentType'] }
//   ]
// })

// module.exports = Document

const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Document = sequelize.define(
  'Document',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true,
      defaultValue: () =>
        `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    },
    title: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    documentType: { type: DataTypes.STRING, field: 'document_type' },
    fileMimeType: { type: DataTypes.STRING, field: 'file_mime_type' },
    ipfsCid: { type: DataTypes.STRING, field: 'ipfs_cid' },
    currentHash: { type: DataTypes.STRING, field: 'current_hash' },
    blockchainTx: { type: DataTypes.STRING, field: 'blockchain_tx' },
    note: { type: DataTypes.TEXT },
    tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    verified: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_deleted'
    },
    state: {
      type: DataTypes.ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'),
      defaultValue: 'DRAFT',
      allowNull: false
    },
    owner: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: 'app_users', key: 'username' }
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'app_users', key: 'id' },
      field: 'owner_id'
    }
  },
  {
    tableName: 'documents',
    timestamps: true,
    underscored: true,
    indexes: [
      // { name: 'documents_ipfs_cid', fields: [{ attribute: 'ipfsCid' }] },
      // { name: 'documents_owner', fields: [{ attribute: 'owner' }] },
      // { name: 'documents_document_type', fields: [{ attribute: 'documentType' }] }
      { name: 'documents_ipfs_cid', fields: ['ipfs_cid'] },
      { name: 'documents_owner', fields: ['owner'] },
      { name: 'documents_document_type', fields: ['document_type'] }
    ]
  }
)

module.exports = Document
