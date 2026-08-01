import express from 'express';
import cors from 'cors';
import pool from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(express.json());

// 🌟 ตัวแปรลับสำหรับสร้าง Token (ของจริงควรเอาไปใส่ในไฟล์ .env เช่น JWT_SECRET=your_secret_key)
const JWT_SECRET = process.env.JWT_SECRET || '8bit-arcade-super-secret-key';

// ==========================================
// 🔐 ระบบ AUTHENTICATION (Login / Register)
// ==========================================

// ---------- POST /api/auth/register (สมัครสมาชิก) ----------
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'กรุณากรอก Username และ Password' });
  }

  const conn = await pool.getConnection();
  try {
    // 1. เช็คว่ามีชื่อนี้ในระบบหรือยัง?
    const [existingUsers] = await conn.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'ชื่อนี้มีคนใช้แล้ว! กรุณาใช้ชื่ออื่น' });
    }

    // 2. เข้ารหัสผ่าน (Hashing)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. บันทึกลง Database
    const [insertResult] = await conn.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, 'player']
    );

    // สร้างข้อมูลสถิติเริ่มต้นให้ User ใหม่ทันที
    await conn.query(
      'INSERT INTO user_stats (user_id, total_score, current_level) VALUES (?, 0, 1)',
      [insertResult.insertId]
    );

    res.status(201).json({ success: true, message: 'สมัครสมาชิกสำเร็จ! กดเข้าสู่ระบบได้เลย' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
  } finally {
    conn.release();
  }
});

// ---------- POST /api/auth/login (เข้าสู่ระบบ) ----------
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'กรุณากรอก Username และ Password' });
  }

  try {
    // 1. ค้นหา User จากชื่อ
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'ไม่พบชื่อผู้ใช้นี้ในระบบ' });
    }

    const user = users[0];

    // 2. ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง!' });
    }

    // 3. สร้างบัตรผ่าน (JWT Token) ให้มีอายุ 24 ชั่วโมง
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // ส่ง Token และข้อมูลเบื้องต้นกลับไปให้ Frontend
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

// ---------- GET /api/categories ----------
app.get('/api/categories', async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories');
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'โหลดหมวดหมู่ไม่สำเร็จ' });
  }
});

// ---------- GET /api/words ----------
app.get('/api/words', async (req, res) => {
  const { category_id, level = 1, limit = 10 } = req.query;

  try {
    const [allWords] = await pool.query('SELECT * FROM words WHERE level = ?', [level]);

    let targetWords = allWords;
    if (category_id) {
      targetWords = allWords.filter(w => w.category_id === Number(category_id));
    }

    if (targetWords.length === 0) {
      return res.status(400).json({ error: 'ไม่พบคำศัพท์ในหมวดนี้' });
    }

    targetWords = targetWords.sort(() => 0.5 - Math.random()).slice(0, Number(limit));

    const questions = targetWords.map((word) => {
      const distractors = allWords
        .filter((w) => w.id !== word.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const formatChoice = (w) => `${w.chinese} (${w.pinyin})`;
      const correctAnswer = formatChoice(word);
      
      let choices = [correctAnswer, ...distractors.map(formatChoice)];
      choices = choices.sort(() => 0.5 - Math.random()); 

      return {
        id: word.id,
        type: 'vocab',
        question: `"${word.thai}" ภาษาจีนคืออะไร?`,
        image_url: word.image_url, 
        choices,
        answer: choices.indexOf(correctAnswer),
      };
    });

    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'โหลดคำถามไม่สำเร็จ' });
  }
});

// ==========================================
// 🛡️ MIDDLEWARE: ด่านตรวจบัตร (Token)
// ==========================================
const authenticateToken = (req, res, next) => {
  // ดึง Token มาจาก Header ที่ Frontend จะส่งมาให้
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // รูปแบบ: "Bearer <token>"

  if (!token) return res.status(401).json({ error: 'ACCESS DENIED: กรุณาล็อกอินก่อน' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'TOKEN EXPIRED: บัตรผ่านหมดอายุหรือแอบอ้าง' });
    req.user = user; // ฝากข้อมูล user (id, username, role) ไว้ใน req
    next(); // ปล่อยผ่านไปทำงานต่อได้
  });
};

// ---------- POST /api/score (อัปเดตใหม่: ต้องใช้ Token) ----------
// สังเกตว่าเราแทรก `authenticateToken` ไว้ตรงกลาง
app.post('/api/score', authenticateToken, async (req, res) => {
  const { category_id, score, total_questions } = req.body;
  
  // 🌟 ไม่ต้องรับ player_name จากหน้าบ้านแล้ว! เราดึง ID จากบัตรผ่าน (Token) ได้เลย
  const userId = req.user.id; 
  const username = req.user.username; 

  if (score == null || !total_questions) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });
  }

  // 🛡️ ANTI-CHEAT: Sanity Check (คงไว้เหมือนเดิม เยี่ยมมากครับ!)
  const maxPossibleScore = Number(total_questions) * 15;
  if (Number(score) < 0 || Number(score) > maxPossibleScore) {
    console.warn(`🚨 [ANTI-CHEAT] สกัดการแฮ็กจาก: ${username} (ยิงมา: ${score}, ลิมิต: ${maxPossibleScore})`);
    return res.status(403).json({ error: 'CHEATER DETECTED 💀: คะแนนเกินขีดจำกัด' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 🌟 1. บันทึกประวัติการเล่น (ไม่ต้องเช็ค/สร้าง User ใหม่แล้ว เพราะล็อกอินมาแล้วชัวร์ๆ)
    await conn.query(
      `INSERT INTO score_history (user_id, category_id, score, total_questions, played_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [userId, category_id, score, total_questions]
    );

    // 🌟 2. อัปเดตคะแนนรวมสะสม
    await conn.query(
      `INSERT INTO user_stats (user_id, total_score, current_level)
       VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE total_score = total_score + VALUES(total_score)`,
      [userId, score]
    );

    // 🌟 3. อัปเดตเลเวล
    const [[stats]] = await conn.query(
      'SELECT total_score FROM user_stats WHERE user_id = ?',
      [userId]
    );
    const newLevel = Math.floor(stats.total_score / 100) + 1;

    await conn.query(
      'UPDATE user_stats SET current_level = ? WHERE user_id = ?',
      [newLevel, userId]
    );

    await conn.commit();
    res.json({ success: true, player: username, total_score: stats.total_score, level: newLevel });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'บันทึกคะแนนไม่สำเร็จ' });
  } finally {
    conn.release();
  }
});

// ---------- GET /api/leaderboard ----------
app.get('/api/leaderboard', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.username, us.total_score, us.current_level
      FROM user_stats us
      JOIN users u ON u.id = us.user_id
      ORDER BY us.total_score DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'โหลด Leaderboard ไม่สำเร็จ' });
  }
});

// ---------- GET /api/auth/me (เช็คข้อมูลผู้ใช้ปัจจุบัน) ----------
// ใช้ Middleware authenticateToken เพื่อดึงข้อมูลเฉพาะของคนที่ล็อกอินอยู่
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // ดึงข้อมูลพื้นฐานและสถิติจากฐานข้อมูล
    const [rows] = await pool.query(`
      SELECT u.id, u.username, u.role, us.total_score, us.current_level
      FROM users u
      LEFT JOIN user_stats us ON u.id = us.user_id
      WHERE u.id = ?
    `, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'โหลดข้อมูลผู้ใช้ไม่สำเร็จ' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));