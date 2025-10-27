const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Approval = sequelize.define('Approval', {
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
  actor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'app_users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.ENUM('SUBMIT', 'APPROVE', 'REJECT'),
    allowNull: false
  },
  comment: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'approvals',
  timestamps: true,
  underscored: true
})

module.exports = Approval
