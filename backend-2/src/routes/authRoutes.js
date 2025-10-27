// routes/authRoutes.js
const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.post('/register', authController.register) // RegisterPage.tsx
router.post('/login', authController.login) // LoginPage.tsx

module.exports = router
