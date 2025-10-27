const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  detail: {
    type: DataTypes.JSONB
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  underscored: true
})

module.exports = AuditLog
