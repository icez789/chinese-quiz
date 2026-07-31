import React from 'react';
import './Leaderboard.css';

export default function Leaderboard({ onHome }) {
  // 🌟 ข้อมูลจำลอง (เดี๋ยวเราค่อยดึงจาก API Backend จริงๆ ทีหลัง)
  const mockHighScores = [
    { rank: 1, name: 'GOD', score: 999990 },
    { rank: 2, name: 'MAX', score: 854020 },
    { rank: 3, name: 'JAY', score: 650100 },
    { rank: 4, name: 'BOY', score: 420050 },
    { rank: 5, name: 'CAT', score: 310000 },
    { rank: 6, name: 'AAA', score: 150000 },
  ];

  return (
    <div className="pixel-leaderboard-wrapper">
      {/* 🌌 ฉากหลังอวกาศและทีวี CRT */}
      <div className="pixel-starfield stars-slow"></div>
      <div className="pixel-starfield stars-medium"></div>
      <div className="pixel-starfield stars-fast"></div>
      <div className="crt-scanlines"></div>

      <div className="pixel-leaderboard-card">
        <h1 className="pixel-leaderboard-title">
          <span className="blink-fast">***</span> HIGH SCORES <span className="blink-fast">***</span>
        </h1>

        {/* 🏆 หัวตาราง */}
        <div className="pixel-table-header">
          <span className="col-rank">RANK</span>
          <span className="col-name">NAME</span>
          <span className="col-score">SCORE</span>
        </div>

        {/* 📋 รายชื่อผู้เล่น */}
        <div className="pixel-table-body">
          {mockHighScores.map((player) => (
            <div 
              key={player.rank} 
              className={`pixel-table-row ${player.rank === 1 ? 'rank-first' : ''} ${player.rank <= 3 ? 'rank-top3' : ''}`}
            >
              <span className="col-rank">
                {player.rank === 1 ? '1ST' : player.rank === 2 ? '2ND' : player.rank === 3 ? '3RD' : `${player.rank}TH`}
              </span>
              <span className="col-name">{player.name}</span>
              <span className="col-score">{String(player.score).padStart(6, '0')}</span>
            </div>
          ))}
        </div>

        {/* 🕹️ ปุ่มกลับหน้าแรก */}
        <div className="pixel-leaderboard-actions">
          <button className="pixel-action-btn btn-home" onClick={onHome}>
            [ RETURN TO TITLE ]
          </button>
        </div>
      </div>
    </div>
  );
}