import React, { useState, useEffect } from 'react'; // 🌟 1. อย่าลืม import useState เข้ามาด้วยนะครับ
import './Home.css';
import { playSound } from '../../SoundManager';
import { triggerPixelBurst } from './PixelBurst'; 

export default function Home({ onStart, onLeaderboard }) {
  // 🌟 2. เพิ่ม State สำหรับเก็บข้อความอธิบายตอนคลิกป้าย
  const [badgeInfo, setBadgeInfo] = useState('');

  const handleHover = () => playSound('tick');
  
  // 🌟 3. ฟังก์ชันจัดการตอนคลิกป้าย
  const handleBadgeClick = (e, type) => {
    e.stopPropagation(); // กันไม่ให้ไปทริกเกอร์เอฟเฟกต์ระเบิดจอซ้ำซ้อน
    playSound('click');
    
    if (type === 'stages') {
      setBadgeInfo('> ท้าทายความจำกับ 10 หมวดหมู่คำศัพท์ ครอบคลุมทุกสถานการณ์!');
    } else if (type === 'words') {
      setBadgeInfo('> ระบบสุ่มคำศัพท์กว่า 100+ คำ เล่นกี่รอบก็เจอคำถามไม่ซ้ำเดิม!');
    }
  };

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (typeof triggerPixelBurst === 'function') triggerPixelBurst(e);
      playSound('wakeup'); 
      // 🌟 แอบซ่อนข้อความอธิบายเวลาผู้เล่นคลิกที่อื่นบนจอ
      setBadgeInfo('');
    };
    
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleStartClick = (e) => {
    e.stopPropagation();
    playSound('start'); 
    setTimeout(() => {
      onStart();
    }, 400); 
  };

  const handleLeaderboardClick = (e) => {
    e.stopPropagation();
    playSound('click'); 
    setTimeout(() => {
      onLeaderboard();
    }, 400); 
  };

  return (
    <div className="pixel-home-container">
      <div className="pixel-starfield stars-slow"></div>
      <div className="pixel-starfield stars-medium"></div>
      <div className="pixel-starfield stars-fast"></div>
      <div className="crt-scanlines"></div>

      <div className="pixel-home-content">
        
        {/* 🕹️ ฝั่งซ้าย: โลโก้และชื่อเกม */}
        <div className="pixel-home-left">
          <div className="pixel-kicker">SYS_INIT // CN_MODE</div>
          
          <h1 className="pixel-main-title">
            <span className="title-line1">CHINESE</span><br/>
            <span className="title-line2">PICTURE</span><br/>
            <span className="title-line3">QUIZ</span>
          </h1>
          
          <p className="pixel-subtitle">
            เกมทายคำศัพท์ภาษาจีนจากรูปภาพ<span className="blink">_</span>
          </p>
          
          {/* 🌟 4. อัปเกรดป้ายให้กดและชี้ได้ */}
          <div className="pixel-badges">
            <span 
              className="pixel-badge interactive"
              onMouseEnter={handleHover}
              onClick={(e) => handleBadgeClick(e, 'stages')}
            >
              [ 10 STAGES ]
            </span>
            <span 
              className="pixel-badge interactive"
              onMouseEnter={handleHover}
              onClick={(e) => handleBadgeClick(e, 'words')}
            >
              [ 100+ WORDS ]
            </span>
          </div>

          {/* 🌟 5. กล่องข้อความอธิบายที่จะโผล่มาตอนกดป้าย */}
          {badgeInfo && (
            <div className="pixel-badge-info">
              {badgeInfo}
            </div>
          )}
        </div>

        {/* 📜 ฝั่งขวา: กติกาและปุ่มต่างๆ (เหมือนเดิม) */}
        <div className="pixel-home-right">
          <div className="pixel-rules-box">
            <h2 className="pixel-rules-title">HOW TO PLAY</h2>
            <ul className="pixel-rules-list">
              <li><span className="bullet">&gt;</span> ดูรูปภาพที่ปรากฏบนหน้าจอ</li>
              <li><span className="bullet">&gt;</span> เลือกคำตอบที่ถูกต้องจาก 4 ตัวเลือก</li>
              <li className="text-green"><span className="bullet">&gt;</span> ตอบถูกรับ +10 คะแนน</li>
              <li className="text-red"><span className="bullet">&gt;</span> ตอบผิดไม่ได้คะแนนนะ!</li>
            </ul>
          </div>
          
          <div className="pixel-button-group">
            <button 
              className="pixel-start-btn" 
              onClick={handleStartClick}
              onMouseEnter={handleHover}
            >
              [ INSERT COIN TO START ]
            </button>
            
            <button 
              className="pixel-secondary-btn" 
              onClick={handleLeaderboardClick}
              onMouseEnter={handleHover}
            >
              [ HIGH SCORES ]
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}