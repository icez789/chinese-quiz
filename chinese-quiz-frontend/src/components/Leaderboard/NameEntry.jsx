import React, { useState, useEffect } from 'react';
import './NameEntry.css';
import { playSound } from '../../SoundManager';

export default function NameEntry({ score, onSubmit }) {
  const [playerName, setPlayerName] = useState('');

  // 🌟 ฟังก์ชันจัดการตอนพิมพ์ข้อความ
  const handleChange = (e) => {
    // บังคับพิมพ์ใหญ่ และจำกัดความยาวแค่ 10 ตัวอักษร
    const value = e.target.value.toUpperCase().slice(0, 10);
    setPlayerName(value);
    playSound('tick'); // มีเสียงติ๊กๆ ตอนพิมพ์ด้วย
  };

  // 🌟 ฟังก์ชันกดยืนยัน
  const handleSubmit = () => {
    if (!playerName.trim()) {
      playSound('wrong'); // ถ้าไม่ยอมพิมพ์ชื่อ ให้ร้องเตือน
      return;
    }
    playSound('levelup');
    onSubmit(playerName.trim(), score);
  };

  // 🌟 เผื่อคนขี้เกียจคลิกปุ่ม ให้กด Enter ส่งได้เลย
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerName]);

  return (
    <div className="pixel-name-wrapper">
      <div className="pixel-starfield stars-slow"></div>
      <div className="pixel-starfield stars-medium"></div>
      <div className="crt-scanlines"></div>

      <div className="pixel-name-card">
        <h1 className="pixel-name-title">NEW HIGH SCORE!</h1>
        <p className="pixel-name-score">SCORE: {String(score).padStart(6, '0')}</p>
        
        <p className="pixel-name-instruction">ENTER YOUR NAME</p>

        {/* 🔠 ช่องพิมพ์ข้อความ (Input) */}
        <div className="pixel-input-container">
          <input
            type="text"
            className="pixel-text-input"
            value={playerName}
            onChange={handleChange}
            placeholder="YOUR NAME"
            autoFocus /* ให้ cursor ไปรอในกล่องทันที */
          />
        </div>

        <button className="pixel-submit-btn" onClick={handleSubmit}>
          [ SUBMIT ]
        </button>
      </div>
    </div>
  );
}