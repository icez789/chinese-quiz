import React, { useState, useEffect, useCallback } from 'react';
import QuestionCard from '../Quiz/QuestionCard'; 
import TimerBar from '../Quiz/TimerBar';
import BossBar from './BossBar';
import { playSound, playBGM, stopBGM } from "../../SoundManager";
import './BossBattle.css';
import bossImg from '../../assets/dragon.png';

const MAX_BOSS_HP = 100; // บอสเลือด 100 (ตอบถูก 10 ข้อตาย)
const MAX_PLAYER_HP = 3;  // เราเลือด 3 (พลาดได้ 2 ครั้ง)
const DMG_PER_HIT = 10;   // ดาเมจที่เราตีบอสต่อข้อ

export default function BossBattle({ onFinish, token }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [bossHp, setBossHp] = useState(MAX_BOSS_HP);
  const [playerHp, setPlayerHp] = useState(MAX_PLAYER_HP);
  const [loading, setLoading] = useState(true);
  
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null); 
  const [bossState, setBossState] = useState('boss-idle'); 
  const [isPlayerHit, setIsPlayerHit] = useState(false); 

  // 🌟 กำหนดไอเทมมาตรฐานที่จะแสดง พร้อมไอคอนและเอฟเฟกต์ (id ตรงกับหน้า Shop)
const BOSS_ITEMS = [
  { id: 'item_5050', name: '50/50', icon: '💡', effectType: '5050', label: '50/50' },
  { id: 'item_freeze', name: 'TIME FREEZE', icon: '⏱️', effectType: 'freeze', label: 'FREEZE' },
  { id: 'item_1up', name: '1-UP', icon: '💖', effectType: '1up', label: '1-UP' },
];

  // 🌟 State สำหรับระบบไอเทม
  const [inventory, setInventory] = useState([]);
  const [disabledChoices, setDisabledChoices] = useState([]); // สำหรับ 50/50
  const [timeFrozen, setTimeFrozen] = useState(false); // สำหรับ Time Freeze

  useEffect(() => {
    // โหลดคำถาม
    fetch('/api/words?level=1&limit=20')
      .then(res => res.json())
      .then(data => { setQuestions(data); setLoading(false); playBGM('quiz_hell'); })
      .catch(err => { console.error(err); setLoading(false); });

    // 🌟 แก้ไข: เรียก API ให้ตรงกับหน้า Shop และแปลงข้อมูลให้เป็น Array
    fetch('/api/shop/inventory', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        // ข้อมูลที่ได้จะเป็น { coins: 100, inventory: { item_5050: 2, item_freeze: 1 } }
        // เราต้องแปลงเฉพาะส่วน inventory ให้กลายเป็น Array ก่อน
        if (data.inventory) {
          const formattedInventory = Object.keys(data.inventory).map(key => ({
            item_id: key,
            quantity: data.inventory[key]
          }));
          setInventory(formattedInventory); // ส่งเข้า State
        }
      })
      .catch(err => console.error("Error fetching inventory:", err));

    return () => stopBGM();
  }, [token]);

  // 🌟 ฟังก์ชันกดใช้ไอเทม
  const handleUseItem = async (itemId, effectType) => {
    playSound('click'); // หรือใส่เสียง powerup

    try {
      const res = await fetch('/api/shop/use', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ item_id: itemId })
      });
      const data = await res.json();
      
      if (data.success) {
        // หักของในกระเป๋าหน้าจอ
        setInventory(prev => prev.map(item => 
          item.item_id === itemId ? { ...item, quantity: data.remaining } : item
        ));
        
        // 🌟 ใช้งานเอฟเฟกต์ตามชนิดไอเทม
        if (effectType === '5050') {
          // สุ่มหาข้อผิด 2 ข้อแล้วตัดทิ้ง
          const correctAns = questions[current].answer;
          let wrongs = [0, 1, 2, 3].filter(i => i !== correctAns);
          wrongs = wrongs.sort(() => 0.5 - Math.random()).slice(0, 2);
          setDisabledChoices(wrongs);
        } else if (effectType === 'freeze') {
          setTimeFrozen(true);
        } else if (effectType === '1up') {
          setPlayerHp(prev => prev + 1); // บอสโหมดให้เลือดทะลุหลอดได้เป็นโบนัส!
        }
      }
    } catch (err) {
      console.error("ใช้ไอเทมไม่สำเร็จ:", err);
    }
  };

  const handleAnswer = useCallback((choiceIndex) => {
    if (selected !== null) return; 
    
    const isCorrect = choiceIndex === questions[current].answer;
    setSelected(choiceIndex);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      playSound('correct'); 
      setBossHp(prev => Math.max(0, prev - DMG_PER_HIT));
      setBossState('boss-hit'); 
    } else {
      playSound('wrong'); 
      setPlayerHp(prev => prev - 1);
      setIsPlayerHit(true); 
    }

    setTimeout(() => {
      setSelected(null);
      setFeedback(null);
      setBossState('boss-idle');
      setIsPlayerHit(false);
      
      // 🌟 ล้างเอฟเฟกต์ไอเทมเมื่อเปลี่ยนข้อ
      setDisabledChoices([]);
      setTimeFrozen(false);

      const nextBossHp = isCorrect ? bossHp - DMG_PER_HIT : bossHp;
      const nextPlayerHp = !isCorrect ? playerHp - 1 : playerHp;

      if (nextBossHp <= 0) {
        stopBGM();
        playSound('levelup');
        onFinish({ score: 500, status: 'VICTORY' }); 
      } else if (nextPlayerHp <= 0 || current + 1 >= questions.length) {
        stopBGM();
        playSound('wrong');
        onFinish({ score: 0, status: 'DEFEAT' });
      } else {
        setCurrent(c => c + 1);
      }
    }, 1200); 

  }, [current, questions, selected, bossHp, playerHp, onFinish]);

  if (loading) return <div className="pixel-loading-container"><div className="pixel-text">SUMMONING_BOSS<span className="blink">_</span></div></div>;

  return (
    <div className="pixel-quiz-wrapper">
      <div className="pixel-starfield stars-slow"></div>
      <div className="pixel-starfield stars-medium"></div>
      <div className="crt-scanlines"></div>

      {isPlayerHit && <div className="damage-flash"></div>}

      {/* 🌟 🎒 แถบไอเทมแนวตั้ง ย้ายมาลอยอยู่ซ้ายสุดของขอบหน้าจอ (เหมือนโหมด Quiz ปกติ) */}
      <div 
        className="pixel-vertical-item-bar" 
        style={{ 
          position: 'absolute', 
          left: '20px', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          zIndex: 100 
        }}
      >
        <h3 className="items-label">ITEMS</h3>
        {BOSS_ITEMS.map(baseItem => {
          const ownedItem = inventory.find(i => i.item_id === baseItem.id);
          const quantity = ownedItem ? ownedItem.quantity : 0;
          
          let isDisabled = quantity <= 0 || selected !== null;
          if (baseItem.effectType === '5050' && disabledChoices.length > 0) isDisabled = true;
          if (baseItem.effectType === 'freeze' && timeFrozen) isDisabled = true;

          return (
            <div 
              key={baseItem.id} 
              className={`pixel-item-box ${isDisabled ? 'disabled' : ''}`}
              onClick={isDisabled ? null : () => handleUseItem(baseItem.id, baseItem.effectType)}
              onMouseEnter={isDisabled ? null : () => playSound('tick')}
            >
              <div className="item-icon">{baseItem.icon}</div>
              <div className="item-details">
                <span className="item-label">{baseItem.label}</span>
                <span className="item-qty">x{quantity}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="boss-battle-layout">
        
        {/* 🐉 ฝั่งซ้าย: โซนบอส (เลือด + ตัวบอส) */}
        <div className="boss-pane">
          <BossBar 
            bossHp={bossHp} maxBossHp={MAX_BOSS_HP} 
            playerHp={playerHp} maxPlayerHp={MAX_PLAYER_HP} 
          />
          <div className={`boss-sprite-container ${bossState}`}>
            <img 
              src={bossImg}
              alt="Ancient Dragon" 
              className="boss-image"
            />
          </div>
        </div>

        {/* ⚔️ ฝั่งขวา: โซนต่อสู้ (เวลา + คำถาม) 🌟 ได้พื้นที่ความกว้างคืนมาเต็มๆ แล้ว! */}
        <div className="combat-pane boss-mode">
          <TimerBar 
            key={current} 
            timeLimit={5} 
            isPaused={selected !== null || timeFrozen} 
            onTimeUp={() => handleAnswer(-1)} 
          />

          <QuestionCard
            question={questions[current]}
            selected={selected}
            feedback={feedback}
            onAnswer={handleAnswer}
            disabledChoices={disabledChoices} 
          />
        </div>

      </div>
    </div>
  );
}
