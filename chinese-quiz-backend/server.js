import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

// ---------- GET /api/categories ----------
// เพิ่ม API นี้ให้ เพื่อดึงรายชื่อหมวดหมู่ทั้ง 10 หมวดไปโชว์ให้ผู้เล่นเลือกบนหน้าเว็บ
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
    // 1. ดึงคำศัพท์ "ทั้งหมด" จากฐานข้อมูล เพื่อเอามาสุ่มเป็นช้อยส์หลอก (ข้ามหมวด)
    const [allWords] = await pool.query('SELECT * FROM words WHERE level = ?', [level]);

    // 2. กรองเฉพาะคำศัพท์ในหมวดที่ผู้เล่นเลือก เพื่อเอามาตั้งเป็นคำถาม
    let targetWords = allWords;
    if (category_id) {
      targetWords = allWords.filter(w => w.category_id === Number(category_id));
    }

    if (targetWords.length === 0) {
      return res.status(400).json({ error: 'ไม่พบคำศัพท์ในหมวดนี้' });
    }

    // สุ่มคำถาม และจำกัดจำนวนข้อ (limit)
    targetWords = targetWords.sort(() => 0.5 - Math.random()).slice(0, Number(limit));

    // 3. สร้างโครงสร้างคำถาม + ตัวเลือก
    const questions = targetWords.map((word) => {
      // สุ่มช้อยส์หลอก 3 ข้อ จาก "คำศัพท์ทั้งหมด" (ดึงข้ามหมวดได้เลย)
      const distractors = allWords
        .filter((w) => w.id !== word.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      // รูปแบบคำตอบ: ตัวจีน + พินอิน (เช่น "苹果 (Píngguǒ)")
      const formatChoice = (w) => `${w.chinese} (${w.pinyin})`;
      const correctAnswer = formatChoice(word);
      
      let choices = [correctAnswer, ...distractors.map(formatChoice)];
      choices = choices.sort(() => 0.5 - Math.random()); // สลับตำแหน่งช้อยส์

      return {
        id: word.id,
        type: 'vocab',
        // คำถามเป็นคำไทย เพื่อให้ไปแมตช์กับช้อยส์ที่เป็นภาษาจีน + พินอิน
        question: `"${word.thai}" ภาษาจีนคืออะไร?`,
        image_url: word.image_url, // โชว์รูปเหมือนเดิม
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

// ---------- POST /api/score ----------
// บันทึกผลการเล่นรอบนี้ + อัปเดตคะแนนสะสม
app.post('/api/score', async (req, res) => {
  const { user_id, category_id, score, total_questions } = req.body;

  if (!user_id || score == null || !total_questions) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO score_history (user_id, category_id, score, total_questions, played_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [user_id, category_id, score, total_questions]
    );

    await conn.query(
      `INSERT INTO user_stats (user_id, total_score, current_level)
       VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE total_score = total_score + VALUES(total_score)`,
      [user_id, score]
    );

    // อัปเดตเลเวลตามคะแนนสะสม (ทุก 100 แต้ม = เลเวลขึ้น 1)
    const [[stats]] = await conn.query(
      'SELECT total_score FROM user_stats WHERE user_id = ?',
      [user_id]
    );
    const newLevel = Math.floor(stats.total_score / 100) + 1;

    await conn.query(
      'UPDATE user_stats SET current_level = ? WHERE user_id = ?',
      [newLevel, user_id]
    );

    await conn.commit();
    res.json({ success: true, total_score: stats.total_score, level: newLevel });
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));