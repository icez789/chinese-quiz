import express from 'express';
import cors from 'cors';
import pool from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import http from 'http'; 
import { Server } from 'socket.io'; 

const app = express();
app.use(cors());
app.use(express.json());

// 🌟 สร้าง HTTP Server และเอา Socket.io มาครอบไว้
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// 🌟 ตัวแปรลับสำหรับสร้าง Token
const JWT_SECRET = process.env.JWT_SECRET || '8bit-arcade-super-secret-key';

// ==========================================
// 🎮 SOCKET.IO: ระบบห้องเรียนเรียลไทม์ (Multiplayer)
// ==========================================

// ตัวแปรสำหรับเก็บข้อมูลห้องเรียนในหน่วยความจำชั่วคราว
const activeRooms = {}; 

io.on('connection', (socket) => {
  console.log(`[SOCKET] สายลับเชื่อมต่อเข้ามาแล้ว: ${socket.id}`);

  // 1. ครู/ผู้คุมสอบ สั่งสร้างห้อง
  socket.on('createRoom', ({ categoryId }) => {
    // สุ่มรหัส PIN 6 หลัก
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    
    // บันทึกข้อมูลห้อง
    activeRooms[pin] = {
      host: socket.id,
      categoryId: categoryId,
      players: []
    };
    
    socket.join(pin); // ให้ครูเข้าไปรอในห้องตัวเอง
    socket.emit('roomCreated', { pin });
    console.log(`[ROOM] สร้างห้องสำเร็จ PIN: ${pin} (หมวดหมู่: ${categoryId})`);
  });

  // 2. นักเรียน กรอก PIN เพื่อเข้าห้อง
  socket.on('joinRoom', ({ pin, username }) => {
    const room = activeRooms[pin];
    
    if (room) {
      // ถ้ารหัสถูก ให้สร้างตัวละครนักเรียน
      const player = { id: socket.id, username, score: 0 };
      room.players.push(player);
      socket.join(pin); // ดึงนักเรียนเข้าห้อง
      
      // ส่งสัญญาณกลับไปบอกนักเรียนว่าเข้าห้องสำเร็จแล้ว
      socket.emit('joinSuccess', { pin, categoryId: room.categoryId });
      
      // ส่งรายชื่ออัปเดตไปบอกครูที่หน้าจอหลัก
      io.to(room.host).emit('playerJoined', room.players);
      
      console.log(`[ROOM] ผู้เล่น ${username} เข้าร่วมห้อง ${pin}`);
    } else {
      // ถ้ารหัสผิด ส่งข้อความแจ้งเตือนกลับไป
      socket.emit('joinError', 'ไม่พบรหัสห้องนี้ หรือห้องถูกปิดไปแล้ว!');
    }
  });

  // 3. เมื่อมีคนหลุดหรือปิดเว็บ
  socket.on('disconnect', () => {
    console.log(`[SOCKET] สายลับตัดการเชื่อมต่อ: ${socket.id}`);
  });

  // 4. เมื่อครู (Host) สั่งเริ่มเกม
  socket.on('startGame', ({ pin, questions }) => {
    console.log(`[ROOM] ผู้บัญชาการสั่งลุย! ห้อง ${pin} เริ่มเกมแล้ว`);
    io.to(pin).emit('missionStarted', questions);
  });

});


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
    const [existingUsers] = await conn.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'ชื่อนี้มีคนใช้แล้ว! กรุณาใช้ชื่ออื่น' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [insertResult] = await conn.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, 'player']
    );

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
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'ไม่พบชื่อผู้ใช้นี้ในระบบ' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง!' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

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
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'ACCESS DENIED: กรุณาล็อกอินก่อน' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'TOKEN EXPIRED: บัตรผ่านหมดอายุหรือแอบอ้าง' });
    req.user = user; 
    next(); 
  });
};

// ==========================================
// 📚 ระบบคลังคำศัพท์ (DICTIONARY)
// ==========================================
app.get('/api/dictionary', authenticateToken, async (req, res) => {
  try {
    // ดึงหมวดหมู่ทั้งหมด (ยกเว้นหมวด 0 ที่เป็นสุ่มมั่ว)
    const [categories] = await pool.query('SELECT * FROM categories WHERE id != 0 ORDER BY id');
    // ดึงคำศัพท์ทั้งหมด
    const [words] = await pool.query('SELECT * FROM words ORDER BY category_id, id');
    
    res.json({ categories, words });
  } catch (err) {
    console.error("Error โหลดคลังคำศัพท์:", err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลคลังคำศัพท์ได้' });
  }
});

// ==========================================
// 🛒 ระบบร้านค้าและกระเป๋าไอเทม (SHOP & INVENTORY)
// ==========================================

// ---------- GET /api/shop/inventory (เช็คเงินและของในกระเป๋า) ----------
app.get('/api/shop/inventory', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [[stats]] = await pool.query('SELECT coins FROM user_stats WHERE user_id = ?', [userId]);
    const [items] = await pool.query('SELECT item_id, quantity FROM user_inventory WHERE user_id = ?', [userId]);
    
    // จัดรูปร่างข้อมูลให้ฝั่งหน้าบ้านใช้ง่ายๆ
    const inventory = {};
    items.forEach(row => {
      inventory[row.item_id] = row.quantity;
    });

    res.json({ coins: stats?.coins || 0, inventory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'โหลดกระเป๋าไม่สำเร็จ' });
  }
});

// ---------- POST /api/shop/buy (ระบบจ่ายเงินซื้อของ) ----------
app.post('/api/shop/buy', authenticateToken, async (req, res) => {
  const { item_id, price } = req.body;
  const userId = req.user.id;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. เช็คเงินในกระเป๋า (ใช้ FOR UPDATE เพื่อป้องกันการกดซื้อรัวๆ บัคปั๊มของ)
    const [[stats]] = await conn.query('SELECT coins FROM user_stats WHERE user_id = ? FOR UPDATE', [userId]);
    if (!stats || stats.coins < price) {
      await conn.rollback();
      return res.status(400).json({ error: 'เงินไม่พอ! ไปฟาร์มคะแนนมาก่อนนะ' });
    }

    // 2. หักเงิน
    await conn.query('UPDATE user_stats SET coins = coins - ? WHERE user_id = ?', [price, userId]);

    // 3. เพิ่มของลงกระเป๋า (ถ้ามีของเดิมอยู่แล้วให้บวกเพิ่ม)
    await conn.query(
      `INSERT INTO user_inventory (user_id, item_id, quantity) 
       VALUES (?, ?, 1) 
       ON DUPLICATE KEY UPDATE quantity = quantity + 1`,
      [userId, item_id]
    );

    await conn.commit();
    res.json({ success: true, remaining_coins: stats.coins - price });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'ทำรายการไม่สำเร็จ' });
  } finally {
    conn.release();
  }
});

// ---------- POST /api/shop/use (ระบบกดใช้ไอเทมตอนเล่นเกม) ----------
app.post('/api/shop/use', authenticateToken, async (req, res) => {
  const { item_id } = req.body;
  const userId = req.user.id;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    // เช็คว่ามีของในกระเป๋าจริงๆ ใช่ไหม
    const [[item]] = await conn.query(
      'SELECT quantity FROM user_inventory WHERE user_id = ? AND item_id = ? FOR UPDATE', 
      [userId, item_id]
    );

    if (!item || item.quantity <= 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'ไอเทมหมดแล้ว!' });
    }

    // หักของ 1 ชิ้น
    await conn.query(
      'UPDATE user_inventory SET quantity = quantity - 1 WHERE user_id = ? AND item_id = ?', 
      [userId, item_id]
    );
    
    await conn.commit();
    res.json({ success: true, remaining: item.quantity - 1 });
  } catch (err) {
    await conn.rollback();
    console.error("Error ตอนใช้ไอเทม:", err);
    res.status(500).json({ error: 'ใช้งานไอเทมไม่สำเร็จ' });
  } finally {
    conn.release();
  }
});

// ---------- POST /api/score ----------
app.post('/api/score', authenticateToken, async (req, res) => {
  const { category_id, score, total_questions } = req.body;
  
  const userId = req.user.id; 
  const username = req.user.username; 

  if (score == null || !total_questions) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });
  }

  const maxPossibleScore = Number(total_questions) * 15;
  if (Number(score) < 0 || Number(score) > maxPossibleScore) {
    console.warn(`🚨 [ANTI-CHEAT] สกัดการแฮ็กจาก: ${username} (ยิงมา: ${score}, ลิมิต: ${maxPossibleScore})`);
    return res.status(403).json({ error: 'CHEATER DETECTED 💀: คะแนนเกินขีดจำกัด' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 🌟 ดักค่า 0 ให้กลายเป็น null ก่อนบันทึกลง Database
    
    await conn.query(
      `INSERT INTO score_history (user_id, category_id, score, total_questions, played_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [userId, category_id, score, total_questions] // ✅ ใช้ category_id ส่งเลข 0 ไปตรงๆ เลย
    );

    await conn.query(
      `INSERT INTO user_stats (user_id, total_score, current_level, coins)
       VALUES (?, ?, 1, ?)
       ON DUPLICATE KEY UPDATE 
         total_score = total_score + VALUES(total_score),
         coins = coins + VALUES(coins)`,
      [userId, score, score] // ส่ง score ไปให้ช่องเหรียญด้วย
    );

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

// ---------- GET /api/auth/me ----------
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
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

// ---------- GET /api/profile ----------
app.get('/api/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [[stats]] = await pool.query(
  'SELECT current_level, total_score, coins FROM user_stats WHERE user_id = ?', 
  [userId]
);

    // 🌟 ดึงข้อมูลประวัติ และแปลงค่า NULL เป็นชื่อโหมดสุ่มมั่ว / HELL MODE
    const [history] = await pool.query(`
      SELECT sh.score, sh.total_questions, sh.played_at, 
             IFNULL(c.name_th, 'สุ่มมั่ว / HELL MODE') as category_name
      FROM score_history sh
      LEFT JOIN categories c ON sh.category_id = c.id
      WHERE sh.user_id = ?
      ORDER BY sh.played_at DESC LIMIT 5
    `, [userId]);

    const [[accData]] = await pool.query(`
      SELECT SUM(score) as total_earned, SUM(total_questions) as total_q
      FROM score_history WHERE user_id = ?
    `, [userId]);

    let accuracy = 0;
    let totalGames = 0;
    if (accData.total_q > 0) {
      const baseMaxScore = accData.total_q * 10;
      accuracy = Math.round((accData.total_earned / baseMaxScore) * 100);
      if (accuracy > 100) accuracy = 100;
      
      const [[gameCount]] = await pool.query('SELECT COUNT(*) as count FROM score_history WHERE user_id = ?', [userId]);
      totalGames = gameCount.count;
    }

    res.json({
      stats: stats || { total_score: 0, current_level: 1 },
      history,
      accuracy,
      totalGames
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'โหลดข้อมูล Profile ไม่สำเร็จ' });
  }
});

const PORT = process.env.PORT || 5000;

// 🚨 สำคัญมาก: เปลี่ยนจาก app.listen เป็น server.listen 
server.listen(PORT, () => {
  console.log(`✅ Server & Socket.io running on port ${PORT}`);
});