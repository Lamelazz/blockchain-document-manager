// config/database.js
const { Sequelize } = require('sequelize')

// ⚠️ Cập nhật thông tin kết nối PostgreSQL của bạn
const sequelize = new Sequelize('doc_manager', 'postgres', 'admin123', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
  define: {
    timestamps: true, // Kích hoạt createdAt và updatedAt mặc định
    underscored: true // Sử dụng snake_case cho tên cột
  }
})

const connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ PostgreSQL connection established successfully.')
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error)
    process.exit(1)
  }
}

module.exports = { sequelize, connectDB }
