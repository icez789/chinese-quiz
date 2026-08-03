import React, { useState, useEffect, useCallback } from 'react';
import QuestionCard from '../Quiz/QuestionCard'; // ดึงของเก่ามาใช้
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
  const [bossState, setBossState] = useState('boss-idle'); // สถานะบอส
  const [isPlayerHit, setIsPlayerHit] = useState(false); // สถานะจอแดง

  useEffect(() => {
    // 🌟 ดึงคำศัพท์แบบสุ่มมา 20 ข้อเผื่อไว้
    fetch('/api/words?level=1&limit=20')
      .then(res => res.json())
      .then(data => { setQuestions(data); setLoading(false); playBGM('quiz_hell'); })
      .catch(err => { console.error(err); setLoading(false); });

    return () => stopBGM();
  }, []);

  const handleAnswer = useCallback((choiceIndex) => {
    if (selected !== null) return; 
    
    const isCorrect = choiceIndex === questions[current].answer;
    setSelected(choiceIndex);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      // ⚔️ เราตีบอส
      playSound('correct'); // แนะนำให้หาเสียง 'hit' หรือเสียงฟันดาบมาใส่แทน
      setBossHp(prev => Math.max(0, prev - DMG_PER_HIT));
      setBossState('boss-hit'); // บอสกระตุก
    } else {
      // 🩸 บอสตีเรา
      playSound('wrong'); // แนะนำให้หาเสียงระเบิดมาใส่
      setPlayerHp(prev => prev - 1);
      setIsPlayerHit(true); // จอแดง
    }

    // ดีเลย์ก่อนไปข้อถัดไป
    setTimeout(() => {
      setSelected(null);
      setFeedback(null);
      setBossState('boss-idle');
      setIsPlayerHit(false);

      const nextBossHp = isCorrect ? bossHp - DMG_PER_HIT : bossHp;
      const nextPlayerHp = !isCorrect ? playerHp - 1 : playerHp;

      if (nextBossHp <= 0) {
        // ชนะบอส!
        stopBGM();
        playSound('levelup');
        onFinish({ score: 500, status: 'VICTORY' }); // ส่งคะแนนโบนัสกลับไป
      } else if (nextPlayerHp <= 0 || current + 1 >= questions.length) {
        // แพ้บอส
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

      {/* 🌟 เลย์เอาต์แบบ 2 ฝั่ง (Split-Screen) */}
      <div className="boss-battle-layout">
        
       {/* 🐉 ฝั่งซ้าย: โซนบอส (เลือด + ตัวบอส) */}
        <div className="boss-pane">
          <BossBar 
            bossHp={bossHp} maxBossHp={MAX_BOSS_HP} 
            playerHp={playerHp} maxPlayerHp={MAX_PLAYER_HP} 
          />
          <div className={`boss-sprite-container ${bossState}`}>
            {/* 🌟 เปลี่ยนจาก Emoji เป็น <img> และใส่ Link รูปจากเน็ต (คุณสามารถหารูปอื่นมาเปลี่ยนตรง src ได้เลย) */}
            <img 
              src={bossImg}
              alt="Ancient Dragon" 
              className="boss-image"
            />
          </div>
        </div>

        {/* ⚔️ ฝั่งขวา: โซนต่อสู้ (เวลา + คำถาม) */}
        <div className="combat-pane boss-mode">
          <TimerBar 
            key={current} 
            timeLimit={5} // 🌟 บอสบังคับตอบไวภายใน 5 วิ!
            isPaused={selected !== null} 
            onTimeUp={() => handleAnswer(-1)} 
          />

          <QuestionCard
            question={questions[current]}
            selected={selected}
            feedback={feedback}
            onAnswer={handleAnswer}
          />
        </div>

      </div>
    </div>
  );
}