import React from 'react';

export default function ScoreBar({ score, combo, current, total, lives, maxLives = 7 }) {
  // 🌟 ฟังก์ชันวาดหัวใจตามจำนวนหลอดเลือดสูงสุดของโหมดนั้นๆ
  const renderHearts = () => {
    const hearts = [];
    // เปลี่ยนจากเลข 7 เป็น maxLives
    for (let i = 0; i < maxLives; i++) {
      hearts.push(
        <span key={i} className={`pixel-heart ${i < lives ? 'alive' : 'dead'}`}>
          {i < lives ? '❤️' : '🖤'}
        </span>
      );
    }
    return hearts;
  };

  return (
    <div className="pixel-score-bar">
      <div className="score-section">
        <span className="label">SCORE:</span>
        <span className="value">{String(score).padStart(6, '0')}</span>
      </div>
      <div className="stage-section">
        <span className="label">STAGE:</span>
        <span className="value">{current}/{total}</span>
      </div>
      {/* 🌟 เพิ่มส่วนหัวใจ (HP) เข้ามา */}
      <div className="lives-section">
        <span className="label">HP:</span>
        <div className="hearts-container">{renderHearts()}</div>
      </div>
      <div className="combo-section">
        <span className="label">COMBO:</span>
        <span className={`value ${combo >= 3 ? 'combo-hot' : ''}`}>
          x{combo}
        </span>
      </div>
    </div>
  );
}