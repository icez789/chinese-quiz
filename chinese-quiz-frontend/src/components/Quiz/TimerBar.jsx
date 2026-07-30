import { useState, useEffect } from 'react';
import { playSound } from '../../SoundManager'; // 🔊 Import ระบบเสียงเข้ามา

export default function TimerBar({ timeLimit = 10, isPaused, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  // 1. ลอจิกนับเวลาถอยหลัง (ตัวเดิม)
  useEffect(() => {
    if (isPaused) return; 

    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isPaused, onTimeUp]);

  // 2. 🔊 ลอจิกเล่นเสียงเตือน (ทำงานทุกครั้งที่ timeLeft เปลี่ยนแปลง)
  useEffect(() => {
    // ถ้ายังไม่ได้ตอบ และเวลาเหลือ 1-3 วินาที ให้เล่นเสียง
    if (!isPaused && timeLeft <= 3 && timeLeft > 0) {
      // 💡 เปลี่ยนชื่อ 'tick' เป็นคีย์เสียงที่คุณตั้งไว้ใน SoundManager นะครับ 
      // (เช่น 'warning', 'countdown', 'beep')
      playSound('tick'); 
    }
  }, [timeLeft, isPaused]);

  return (
    <div className={`timer-container ${timeLeft <= 2 && !isPaused ? 'danger-shake' : ''}`}>
      <div 
        className={`timer-bar ${timeLeft > 5 ? 'safe' : timeLeft > 2 ? 'warning' : 'danger'}`} 
        style={{ width: `${(timeLeft / timeLimit) * 100}%` }}
      ></div>
    </div>
  );
}