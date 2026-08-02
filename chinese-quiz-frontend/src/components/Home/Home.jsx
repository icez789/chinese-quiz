import React, { useState, useEffect } from 'react'; 
import './Home.css';
// 🌟 1. นำเข้า playBGM เข้ามาจาก SoundManager
import { playSound, playBGM } from '../../SoundManager';
import { triggerPixelBurst } from './PixelBurst'; 

export default function Home({ onStart, onLeaderboard, onMultiplayer }) { 
  const [badgeInfo, setBadgeInfo] = useState('');

  // 🌟 2. ใช้ useEffect สั่งให้เล่นเพลงเพลย์ลิสต์ 'home' ทันทีที่เปิดหน้านี้ขึ้นมา
  useEffect(() => {
    playBGM('home');
  }, []);

  const handleHover = () => playSound('tick');
  
  const handleBadgeClick = (e, type) => {
    e.stopPropagation(); 
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

  const handleMultiplayerClick = (e) => {
    e.stopPropagation();
    playSound('start'); 
    setTimeout(() => {
      onMultiplayer();
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

          {badgeInfo && (
            <div className="pixel-badge-info">
              {badgeInfo}
            </div>
          )}
        </div>

        {/* 📜 ฝั่งขวา: กติกาและปุ่มต่างๆ */}
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