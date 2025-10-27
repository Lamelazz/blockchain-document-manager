const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { connectDB, sequelize } = require('./config/database')

// Chỉ cần require để khởi tạo models & relationships, KHÔNG destructure
require('./models')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})

// Routes
const authRoutes = require('./routes/authRoutes')
const documentRoutes = require('./routes/documentRoutes')
const adminRoutes = require('./routes/adminRoutes')

app.get('/', (req, res) => {
  res.json({
    message: 'Document Manager API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      documents: '/api/documents',
      admin: '/api/admin'
    }
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/admin', adminRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// Khởi động server
const startServer = async () => {
  try {
    await connectDB()

    await sequelize.sync({ alter: true })
    // await sequelize.sync({ force: true })
    console.log('✅ Database synced successfully')

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`)
      console.log(`❤️  Health check: http://localhost:${PORT}/health`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
