import React, { useState, useEffect } from 'react';
import './ResultScreen.css';
import { playSound, playBGM } from '../../SoundManager'; 

export default function ResultScreen({ result, onRetry, onHome, onSave }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    playBGM('result');
  }, []);

  const score = result?.score || 0;
  
  // 🌟 แก้ไข: เปลี่ยนตัวแปรให้เข้าใจง่ายขึ้น (มันคือ "คะแนนเต็ม" ไม่ใช่จำนวนข้อ)
  const maxScore = result?.total || 100; 
  
  // 🌟 แก้ไขบัค: หารด้วย maxScore ตรงๆ ไม่ต้องคูณ 10 แล้ว
  let percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  
  if (percent > 100) percent = 100; // กันเปอร์เซ็นต์ทะลุ 100 กรณีได้คอมโบโบนัส

  let rank = 'F';
  let rankText = 'GAME OVER! ต้องฝึกอีกนิดนะ 💀';
  let rankClass = 'rank-f';

  // 🌟 เพิ่มเงื่อนไขพิเศษ: ถ้าเป็นผลลัพธ์จากโหมด Boss Battle
  if (result?.isBossMode) {
    if (result.status === 'VICTORY') {
      rank = 'SSS';
      rankText = 'DRAGON SLAYER! ผู้พิชิตมังกร 🐉🔥';
      rankClass = 'rank-s';
      percent = 100;
    } else {
      rank = 'F';
      rankText = 'WASTED! กลายเป็นอาหารมังกร 🥩';
      rankClass = 'rank-f';
      percent = 0;
    }
  } else {
    // 🌟 โหมดเล่นปกติ (ควิซ)
    if (percent >= 100) { rank = 'S'; rankText = 'PERFECT! ระดับปรมาจารย์ 🔥'; rankClass = 'rank-s'; }
    else if (percent >= 80) { rank = 'A'; rankText = 'AWESOME! ฝีมือระดับเซียน 🏆'; rankClass = 'rank-a'; }
    else if (percent >= 60) { rank = 'B'; rankText = 'GREAT! ทำได้ดีเลยทีเดียว 👏'; rankClass = 'rank-b'; }
    else if (percent >= 40) { rank = 'C'; rankText = 'NOT BAD! ไปต่อได้อีกสู้ๆ 💪'; rankClass = 'rank-c'; }
  }

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

  const handleHover = () => playSound('tick');

  const handleRetryClick = () => {
    playSound('start'); 
    setTimeout(() => onRetry(), 400);
  };

  const handleSaveClick = () => {
    playSound('click'); 
    setTimeout(() => onSave(), 400);
  };

  const handleHomeClick = () => {
    playSound('click'); 
    setTimeout(() => onHome(), 400);
  };

  return (
    <div className="pixel-result-wrapper">
      <div className="pixel-starfield stars-slow"></div>
      <div className="pixel-starfield stars-medium"></div>
      <div className="pixel-starfield stars-fast"></div>
      <div className="crt-scanlines"></div>

      <div className="pixel-result-card">
        {/* 🌟 เปลี่ยนหัวข้อตามโหมดที่เล่น */}
        <h1 className="pixel-result-title">
          {result?.isBossMode ? (result.status === 'VICTORY' ? 'BOSS DEFEATED' : 'YOU DIED') : 'MISSION COMPLETE'}
        </h1>
        
        <div className="pixel-rank-container">
          <div className={`pixel-rank-badge ${rankClass}`}>{rank}</div>
          <p className="pixel-rank-text">{rankText}</p>
        </div>

        <div className="pixel-stats-grid">
          <div className="pixel-stat-box">
            <span className="pixel-stat-label">SCORE</span>
            <span className="pixel-stat-value highlight">
              {String(displayScore).padStart(6, '0')}
            </span>
          </div>
          <div className="pixel-stat-box">
            <span className="pixel-stat-label">ACCURACY</span>
            <span className="pixel-stat-value">{percent}%</span>
          </div>
        </div>

        <div className="pixel-result-actions">
          <button className="pixel-action-btn btn-retry" onClick={handleRetryClick} onMouseEnter={handleHover}>
            [ INSERT COIN TO RETRY ]
          </button>
          <button className="pixel-action-btn btn-retry" onClick={handleSaveClick} onMouseEnter={handleHover}>
            [ SAVE HIGH SCORE ]
          </button>
      
          <button className="pixel-action-btn btn-home" onClick={handleHomeClick} onMouseEnter={handleHover}>
            [ RETURN TO TITLE ]
          </button>
        </div>
      </div>
    </div>
  );
}