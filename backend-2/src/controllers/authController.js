// controllers/authController.js
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { logAudit } = require('./adminController')
const { JWT_SECRET, JWT_EXPIRATION } = require('../config/jwt')

/**
 * Xử lý yêu cầu Đăng ký tài khoản mới (RegisterPage.tsx)
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body

    // 1. Kiểm tra tồn tại
    const existingUser = await User.findOne({ where: { username } })
    if (existingUser) {
      return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại.' })
    }

    // Frontend đã kiểm tra tính hợp lệ cơ bản, Backend kiểm tra lại:
    if (!username || !email || !password || password.length < 6) {
      return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin và mật khẩu phải từ 6 ký tự.' })
    }

    // 2. Hash mật khẩu và tạo người dùng
    const passwordHash = await bcrypt.hash(password, 10)
    const newUser = await User.create({
      username: username.trim(),
      email: email.trim(),
      passwordHash,
      role: 'user'
    })

    const token = jwt.sign(
      { username: newUser.username, role: newUser.role, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    )

    logAudit('REGISTER', newUser.username, { email: newUser.email })

    res.status(201).json({ token, username: newUser.username, role: newUser.role, email: newUser.email })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Đăng ký thất bại. Vui lòng thử lại.' })
  }
}

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu.' })
    }

    // 1. Tìm người dùng theo tên đăng nhập
    const user = await User.findOne({ where: { username } })
    if (!user) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không hợp lệ.' })
    }

    // 2. So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không hợp lệ.' })
    }

    const token = jwt.sign(
      { username: user.username, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    )

    logAudit('LOGIN', user.username, {})

    res.json({ token, username: user.username, role: user.role, email: user.email })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Đăng nhập thất bại.' })
  }
}
