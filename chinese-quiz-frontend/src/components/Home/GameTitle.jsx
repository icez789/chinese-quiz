import React from 'react';

function GameTitle() {
  return (
    <div className="game-title-container">
      <h2 className="subtitle">🇨🇳 看图猜词</h2>
      <h1 className="title">Chinese Picture Quiz</h1>
      <p className="description">เกมทายคำศัพท์ภาษาจีนจากรูปภาพ</p>

      <div className="stat-badges">
        <span className="stat-pill">📚 10 หมวดหมู่</span>
        <span className="stat-pill">🈺 100+ คำศัพท์</span>
      </div>
    </div>
  );
}

export default GameTitle;