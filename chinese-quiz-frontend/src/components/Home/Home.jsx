import React, { useEffect } from 'react';
import './Home.css';
import { playSound } from '../../SoundManager';
import { triggerPixelBurst } from './PixelBurst'; 

export default function Home({ onStart, onLeaderboard }) {
  const handleHover = () => playSound('tick');
  
  // 🌟 เปิดระบบคลิกแล้วระเบิด "ทุกที่บนหน้าจอ" + ปลุกระบบเสียง
  useEffect(() => {
    const handleGlobalClick = (e) => {
      triggerPixelBurst(e);
      // 🔊 ทริคปลดล็อก: สั่งเล่นเสียงที่ไม่มีอยู่จริง (เช่น 'wakeup') 
      // เพื่อบังคับให้เบราว์เซอร์เปิดใช้งาน AudioContext ทันทีที่ผู้เล่นคลิกจอครั้งแรก
      playSound('wakeup'); 
    };
    
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // 🌟 ฟังก์ชันสำหรับปุ่มเริ่มเกม
  const handleStartClick = () => {
    playSound('start'); 
    setTimeout(() => {
      onStart();
    }, 400); 
  };

  // 🌟 ฟังก์ชันสำหรับปุ่ม Leaderboard
  const handleLeaderboardClick = () => {
    playSound('click'); // เปลี่ยน Leaderboard เป็นเสียง click ธรรมดาจะได้ต่างกับปุ่ม Start
    setTimeout(() => {
      onLeaderboard();
    }, 400); 
  };

  return (
    <div className="pixel-home-container">
      {/* 🌌 ฉากหลังอวกาศ */}
      <div className="pixel-starfield stars-slow"></div>
      <div className="pixel-starfield stars-medium"></div>
      <div className="pixel-starfield stars-fast"></div>

      {/* 📺 เอฟเฟกต์หน้าจอ CRT */}
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
            <span className="pixel-badge">[ 10 STAGES ]</span>
            <span className="pixel-badge">[ 100+ WORDS ]</span>
          </div>
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
          
          {/* 🌟 จัดกลุ่มปุ่มให้อยู่ด้วยกัน */}
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