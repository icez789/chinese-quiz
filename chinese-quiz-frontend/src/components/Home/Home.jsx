import React from 'react';
import GameTitle from './GameTitle';
import HowToPlay from './HowToPlay';
import StartButton from './StartButton';
import MatrixRain from './MatrixRain';
import './Home.css';

// รับ prop onStart ที่ถูกส่งมาจาก App.jsx
function Home({ onStart }) { 

  const handleStartGame = () => {
    console.log('Initiating Cyber Sequence...');
    // สั่งรันฟังก์ชันที่ App.jsx ส่งมา (เพื่อเปลี่ยน state screen เป็น 'quiz')
    if (onStart) {
      onStart(); 
    }
  };

  return (
    <div className="home-container">
      <div className="bg-grid"></div>
      <MatrixRain />
      <div className="bg-glow-left"></div>
      <div className="bg-glow-right"></div>

      <div className="home-layout">
        <div className="home-left">
          <GameTitle />
        </div>

        <div className="home-right">
          <HowToPlay />
          <div className="action-wrapper">
            {/* ส่งฟังก์ชัน handleStartGame ไปให้ปุ่ม StartButton */}
            <StartButton onStart={handleStartGame} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;