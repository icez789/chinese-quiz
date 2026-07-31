import React, { useState, useEffect } from 'react';
import './ResultScreen.css';

export default function ResultScreen({ result, onRetry, onHome, onSave }) {
  const [displayScore, setDisplayScore] = useState(0);

  const score = result?.score || 0;
  const totalQuestions = result?.total || 10;
  
  let percent = totalQuestions > 0 ? Math.round((score / (totalQuestions * 10)) * 100) : 0;
  if (percent > 100) percent = 100;

  // ปรับคำพูดให้ได้ฟีลเกมเมอร์มากขึ้น
  let rank = 'F';
  let rankText = 'GAME OVER! ต้องฝึกอีกนิดนะ 💀';
  let rankClass = 'rank-f';

  if (percent >= 100) { rank = 'S'; rankText = 'PERFECT! ระดับปรมาจารย์ 🔥'; rankClass = 'rank-s'; }
  else if (percent >= 80) { rank = 'A'; rankText = 'AWESOME! ฝีมือระดับเซียน 🏆'; rankClass = 'rank-a'; }
  else if (percent >= 60) { rank = 'B'; rankText = 'GREAT! ทำได้ดีเลยทีเดียว 👏'; rankClass = 'rank-b'; }
  else if (percent >= 40) { rank = 'C'; rankText = 'NOT BAD! ไปต่อได้อีกสู้ๆ 💪'; rankClass = 'rank-c'; }

  useEffect(() => {
    if (score === 0) return;
    
    let current = 0;
    const step = Math.ceil(score / 50); 
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
    <div className="pixel-result-wrapper">
      {/* 🌌 ฉากหลังอวกาศและทีวี CRT */}
      <div className="pixel-starfield stars-slow"></div>
      <div className="pixel-starfield stars-medium"></div>
      <div className="pixel-starfield stars-fast"></div>
      <div className="crt-scanlines"></div>

      <div className="pixel-result-card">
        <h1 className="pixel-result-title">MISSION COMPLETE</h1>
        
        {/* โชว์ตราประทับ Rank */}
        <div className="pixel-rank-container">
          <div className={`pixel-rank-badge ${rankClass}`}>{rank}</div>
          <p className="pixel-rank-text">{rankText}</p>
        </div>

        {/* สถิติ */}
        <div className="pixel-stats-grid">
          <div className="pixel-stat-box">
            <span className="pixel-stat-label">SCORE</span>
            {/* เติมเลข 0 ด้านหน้าให้ครบ 6 หลัก สไตล์ตู้เกม */}
            <span className="pixel-stat-value highlight">
              {String(displayScore).padStart(6, '0')}
            </span>
          </div>
          <div className="pixel-stat-box">
            <span className="pixel-stat-label">ACCURACY</span>
            <span className="pixel-stat-value">{percent}%</span>
          </div>
        </div>

        {/* ปุ่มกดสไตล์อาร์เคด */}
        <div className="pixel-result-actions">
          <button className="pixel-action-btn btn-retry" onClick={onRetry}>
            [ INSERT COIN TO RETRY ]
          </button>
          {/* 🌟 2. เพิ่มปุ่ม SAVE SCORE เข้าไปบนสุด (ใช้คลาส btn-retry สีเขียวให้เด่นๆ) */}
          <button className="pixel-action-btn btn-retry" onClick={onSave}>
            [ SAVE HIGH SCORE ]
          </button>
          {/* ปุ่มเดิม (แอบเปลี่ยนสีปุ่ม Retry ให้เป็นสีฟ้า/เหลืองแทนจะได้ไม่แย่งซีน) */}
          <button className="pixel-action-btn btn-home" onClick={onRetry}>
            [ PLAY AGAIN ]
          </button>
          <button className="pixel-action-btn btn-home" onClick={onHome}>
            [ RETURN TO TITLE ]
          </button>
        </div>
      </div>
    </div>
  );
}