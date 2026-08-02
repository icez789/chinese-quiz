import React, { useState, useEffect } from 'react';
import './Leaderboard.css';
import { playSound, playBGM } from '../../SoundManager';

export default function Leaderboard({ onHome }) {
  const [highScores, setHighScores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🌟 2. เพิ่ม useEffect สำหรับรันเพลง BGM ทันทีที่เข้ามาหน้านี้
  useEffect(() => {
    playBGM('leaderboard');
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard');
        if (!res.ok) throw new Error('ดึงข้อมูล Leaderboard ไม่สำเร็จ');
        
        const data = await res.json();
        
        const formattedScores = data.map((player, index) => ({
          rank: index + 1, 
          name: player.username,
          score: player.total_score
        }));
        
        setHighScores(formattedScores);
        
        // 🌟 (ออปชันเสริม) พอโหลดคะแนนเสร็จปุ๊บ ให้มีเสียงวิ้งๆ เปิดตัวกระดานคะแนน
        if (formattedScores.length > 0) {
          playSound('levelup'); 
        }

      } catch (err) {
        console.error(err);
        setError('CONNECTION LOST_');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // 🌟 2. สร้างฟังก์ชันกดปุ่มกลับหน้าแรก (เล่นเสียง -> รอ 0.4 วิ -> ค่อยเปลี่ยนหน้า)
  const handleHomeClick = () => {
    playSound('click'); 
    setTimeout(() => {
      onHome();
    }, 400);
  };

  // 🌟 3. เสียงตอนเอาเมาส์ไปชี้ปุ่ม
  const handleHover = () => playSound('tick');

  return (
    <div className="pixel-leaderboard-wrapper">
      <div className="pixel-starfield stars-slow"></div>
      <div className="pixel-starfield stars-medium"></div>
      <div className="pixel-starfield stars-fast"></div>
      <div className="crt-scanlines"></div>

      <div className="pixel-leaderboard-card">
        <h1 className="pixel-leaderboard-title">
          <span className="blink-fast">***</span> HIGH SCORES <span className="blink-fast">***</span>
        </h1>

        <div className="pixel-table-header">
          <span className="col-rank">RANK</span>
          <span className="col-name">NAME</span>
          <span className="col-score">SCORE</span>
        </div>

        <div className="pixel-table-body">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#00f2fe' }} className="blink">
              LOADING_DATA...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--pixel-red)' }} className="blink">
              {error}
            </div>
          ) : highScores.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#fff' }}>
              NO RECORDS YET
            </div>
          ) : (
            highScores.map((player) => (
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
            ))
          )}
        </div>

        <div className="pixel-leaderboard-actions">
          {/* 🌟 4. เอาฟังก์ชันคลิกกับชี้เมาส์มาใส่ที่ปุ่ม */}
          <button 
            className="pixel-action-btn btn-home" 
            onClick={handleHomeClick}
            onMouseEnter={handleHover}
          >
            [ RETURN TO TITLE ]
          </button>
        </div>
      </div>
    </div>
  );
}