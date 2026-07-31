import { useState, useEffect, useCallback } from 'react';
import QuestionCard from './QuestionCard';
import ScoreBar from './ScoreBar';
import TimerBar from './TimerBar';
import { playSound } from "../../SoundManager";
import { triggerPixelBurst } from '../Home/PixelBurst'; // 💥 ดึงเอฟเฟกต์ระเบิดมาใช้ (เช็ค Path ให้ตรงด้วยนะครับ)
import './Quiz.css';

const API_BASE = 'http://localhost:5000';

export default function Quiz({ userId, categoryId, level, onFinish }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null); 
  const [lives, setLives] = useState(7);

  useEffect(() => {
    let fetchUrl = `${API_BASE}/api/words?level=${level}&limit=10`;
    if (categoryId !== 'all') {
      fetchUrl += `&category_id=${categoryId}`;
    }

    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('โหลดคำถามไม่สำเร็จ', err);
        setLoading(false);
      });
  }, [categoryId, level]); 

  // 🌟 เพิ่มรับค่า e เข้ามา เพื่อให้รู้พิกัดเมาส์ตอนระเบิด
 const handleAnswer = useCallback(
    (choiceIndex, e) => {
      if (selected !== null) return; 
      if (e) triggerPixelBurst(e);
      
      const q = questions[current];
      const isCorrect = choiceIndex === q.answer;

      setSelected(choiceIndex);
      setFeedback(isCorrect ? 'correct' : 'wrong');
      playSound(isCorrect ? 'correct' : 'wrong');

      let currentLives = lives; // 🌟 เก็บค่าเลือดปัจจุบันไว้ใช้ตรวจสอบ

      if (isCorrect) {
        const bonus = combo >= 3 ? 15 : 10; 
        setScore((s) => s + bonus);
        setCombo((c) => c + 1);
      } else {
        setCombo(0);
        // 🌟 2. หักเลือด 1 ดวง
        currentLives = lives - 1;
        setLives(currentLives);
      }

      setTimeout(() => {
        setSelected(null);
        setFeedback(null);
        
        // 🌟 3. เช็คว่าเลือดหมดหรือยัง?
        if (currentLives <= 0) {
          finishQuiz(); // เลือดหมด ตาย! (Game Over)
        } else if (current + 1 < questions.length) {
          setCurrent((c) => c + 1); // ไปข้อต่อไป
        } else {
          finishQuiz(); // ตอบครบทุกข้อแล้ว (Win)
        }
      }, 1000); 
    },
    // 🌟 4. อย่าลืมเพิ่ม lives เข้าไปใน Array ด้านล่างนี้ด้วยครับ!
    [current, questions, selected, combo, lives] 
  );

  const finishQuiz = async () => {
    playSound('finish');
    try {
      const res = await fetch(`${API_BASE}/api/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          category_id: categoryId === 'all' ? 0 : categoryId,
          score,
          total_questions: questions.length,
          
        }),
      });
      const result = await res.json();
      onFinish({ score, total: questions.length, ...result });
    } catch (err) {
      console.error('บันทึกคะแนนไม่สำเร็จ', err);
      onFinish({ score, total: questions.length });
    }
  };

  // 🌟 เปลี่ยนหน้า Loading ให้เป็นแบบ 8-bit
  if (loading) return (
    <div className="pixel-loading-container">
      <div className="pixel-text">LOADING_DATA<span className="blink">_</span></div>
    </div>
  );
  if (!questions.length) return (
    <div className="pixel-loading-container">
      <div className="pixel-text" style={{color: 'var(--pixel-red)'}}>ERR: DATA_NOT_FOUND</div>
    </div>
  );

  return (
    <div className="pixel-quiz-wrapper">
      {/* 🌌 ฉากหลังอวกาศ และ CRT */}
      <div className="pixel-starfield stars-slow"></div>
      <div className="pixel-starfield stars-medium"></div>
      <div className="pixel-starfield stars-fast"></div>
      <div className="crt-scanlines"></div>

      <div className="pixel-quiz-content">
        <ScoreBar
          score={score}
          combo={combo}
          current={current + 1}
          total={questions.length}
          lives={lives} // 🌟 5. ส่งค่าเลือดไปให้แถบคะแนน
        />
        
        <TimerBar 
          key={current} 
          timeLimit={10} 
          isPaused={selected !== null} 
          onTimeUp={() => handleAnswer(-1, null)} // ส่ง null แทน e เพื่อบอกว่าไม่ได้เกิดจากการคลิก
        />

        <QuestionCard
          question={questions[current]}
          selected={selected}
          feedback={feedback}
          onAnswer={handleAnswer}
        />
      </div>
    </div>
  );
}