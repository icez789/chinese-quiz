import React, { useState, useEffect } from 'react';
import './ResultScreen.css';
import { playSound } from '../../SoundManager'; // 🌟 1. ดึงระบบเสียงเข้ามา

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

  // 🌟 2. ฟังก์ชันจัดการเสียงตอนชี้ปุ่ม
  const handleHover = () => playSound('tick');

  // 🌟 3. ฟังก์ชันจัดการเสียงและหน่วงเวลาตอนคลิก
  const handleRetryClick = () => {
    playSound('start'); // เสียงเริ่มเกม
    setTimeout(() => onRetry(), 400);
  };

  const handleSaveClick = () => {
    playSound('click'); // เสียงกดยืนยัน
    setTimeout(() => onSave(), 400);
  };

  const handleHomeClick = () => {
    playSound('click'); 
    setTimeout(() => onHome(), 400);
  };

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
          {/* 🌟 4. ใส่ Event เสียงเข้าไปในปุ่ม */}
          <button className="pixel-action-btn btn-retry" onClick={handleRetryClick} onMouseEnter={handleHover}>
            [ INSERT COIN TO RETRY ]
          </button>
          <button className="pixel-action-btn btn-retry" onClick={handleSaveClick} onMouseEnter={handleHover}>
            [ SAVE HIGH SCORE ]
          </button>
          <button className="pixel-action-btn btn-home" onClick={handleRetryClick} onMouseEnter={handleHover}>
            [ PLAY AGAIN ]
          </button>
          <button className="pixel-action-btn btn-home" onClick={handleHomeClick} onMouseEnter={handleHover}>
            [ RETURN TO TITLE ]
          </button>
        </div>
      </div>
    </div>
  );
}