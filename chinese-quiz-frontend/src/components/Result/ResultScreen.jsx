import React, { useState, useEffect } from 'react';
import './ResultScreen.css'; // อย่าลืมสร้างไฟล์นี้ด้วยนะ

export default function ResultScreen({ result, onRetry, onHome }) {
  const [displayScore, setDisplayScore] = useState(0);

  // ดึงค่ามาจากผลลัพธ์ (ถ้าเล่นได้ 0 ก็ให้ fallback เป็น 0)
  const score = result?.score || 0;
  const totalQuestions = result?.total || 10;
  
  // คำนวณเปอร์เซ็นต์ (เอาคะแนนที่ได้ หารด้วย คะแนนเต็มแบบไม่รวมคอมโบ)
  // ถ้าทำคอมโบเยอะ % อาจจะทะลุ 100 ได้ เราเลยล็อคไว้ที่ 100% เป็นสูงสุด
  let percent = totalQuestions > 0 ? Math.round((score / (totalQuestions * 10)) * 100) : 0;
  if (percent > 100) percent = 100;

  // ลอจิกการให้ Rank
  let rank = 'F';
  let rankText = 'อย่าเพิ่งท้อ! ฝึกอีกนิดเดี๋ยวก็เก่ง 🌱';
  let rankClass = 'rank-f';

  if (percent >= 100) { rank = 'S'; rankText = 'ไร้เทียมทาน! ระดับปรมาจารย์ 🔥'; rankClass = 'rank-s'; }
  else if (percent >= 80) { rank = 'A'; rankText = 'ยอดเยี่ยม! ฝีมือระดับเซียน 🏆'; rankClass = 'rank-a'; }
  else if (percent >= 60) { rank = 'B'; rankText = 'เก่งมาก! ทำได้ดีเลยทีเดียว 👏'; rankClass = 'rank-b'; }
  else if (percent >= 40) { rank = 'C'; rankText = 'ใช้ได้! ไปต่อได้อีกสู้ๆ 💪'; rankClass = 'rank-c'; }

  // เอฟเฟกต์ตัวเลขคะแนนวิ่งรัวๆ
  useEffect(() => {
    if (score === 0) return;
    
    let current = 0;
    const step = Math.ceil(score / 50); // ความเร็วในการวิ่ง
    const timer = setInterval(() => {
      current += step;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(current);
      }
    }, 20);

    return () => clearInterval(timer);
  }, [score]);

  return (
    <div className="result-container">
      <div className="result-card">
        <h1 className="result-title">MISSION COMPLETE</h1>
        
        {/* โชว์ตราประทับ Rank */}
        <div className="rank-container">
          <div className={`rank-badge ${rankClass}`}>{rank}</div>
          <p className="rank-text">{rankText}</p>
        </div>

        {/* สถิติ */}
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-label">SCORE</span>
            <span className="stat-value highlight">{displayScore}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">ACCURACY</span>
            <span className="stat-value">{percent}%</span>
          </div>
        </div>

        {/* ปุ่มกดสไตล์อาร์เคด */}
        <div className="result-actions">
          <button className="action-btn btn-retry" onClick={onRetry}>
            🔄 เล่นอีกครั้ง
          </button>
          <button className="action-btn btn-home" onClick={onHome}>
            🏠 กลับหน้าแรก
          </button>
        </div>
      </div>
    </div>
  );
}