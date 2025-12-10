const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { logAudit } = require("./adminController");
const { JWT_SECRET, JWT_EXPIRATION } = require("../config/jwt");


/* ============================================================
   🚀 TẠO ADMIN MẶC ĐỊNH (Chạy tự động khi server khởi động)
===============================================================*/
(async function ensureDefaultAdmin() {
  const admin = await User.findOne({ where: { username: "admin" } });
  if (!admin) {
    const hash = await bcrypt.hash("admin", 10); // mật khẩu = admin
    await User.create({
      username: "admin",
      email: "admin@local",
      passwordHash: hash,       // ⚠ mapping đúng sang password_hash
      role: "admin"
    });
    console.log("✔ Admin created automatically → login: admin / admin");
  }
})();


/* ============================================================
   🔥 REGISTER USERS (FE /register gọi)
===============================================================*/
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password || password.length < 6)
      return res.status(400).json({ message: "Mật khẩu tối thiểu 6 ký tự." });

    const exists = await User.findOne({ where: { username } });
    if (exists) return res.status(409).json({ message: "Tên đăng nhập đã tồn tại." });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      passwordHash: hash,
      role: "user"
    });

    const token = jwt.sign(
      { username:user.username, email:user.email, role:user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    logAudit("REGISTER", username);
    return res.status(201).json({ token, user });
    
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Lỗi server khi đăng ký." });
  }
};



/* ============================================================
   🔥 LOGIN USERS (FE /login dùng)
===============================================================*/
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "Thiếu username/password." });

    const user = await User.findOne({ where: { username } });

    if (!user) return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu." });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu." });

    const token = jwt.sign(
      { username: user.username, role:user.role, email:user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    logAudit("LOGIN", username);
    return res.status(200).json({ token, user });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Lỗi server khi đăng nhập." });
  }
};
