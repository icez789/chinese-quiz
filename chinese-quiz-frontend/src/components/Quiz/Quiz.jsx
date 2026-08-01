import { useState, useEffect, useCallback } from 'react';
import QuestionCard from './QuestionCard';
import ScoreBar from './ScoreBar';
import TimerBar from './TimerBar';
import { playSound } from "../../SoundManager";
import { triggerPixelBurst } from '../Home/PixelBurst'; 
import './Quiz.css';

const API_BASE = '';

export default function Quiz({ categoryId, level, onFinish }) {
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

  const handleAnswer = useCallback(
    (choiceIndex, e) => {
      if (selected !== null) return; 
      if (e) triggerPixelBurst(e);
      
      const q = questions[current];
      const isCorrect = choiceIndex === q.answer;

      setSelected(choiceIndex);
      setFeedback(isCorrect ? 'correct' : 'wrong');
      playSound(isCorrect ? 'correct' : 'wrong');

      let currentLives = lives; 

      // 🌟 คำนวณคะแนนที่จะได้ (ใส่ let ไว้เพื่อให้ใช้ใน logic จบเกมได้)
      let earnedScore = 0;

      if (isCorrect) {
        earnedScore = combo >= 3 ? 15 : 10; 
        setScore((s) => s + earnedScore);
        setCombo((c) => c + 1);
      } else {
        setCombo(0);
        currentLives = lives - 1;
        setLives(currentLives);
      }

      setTimeout(() => {
        setSelected(null);
        setFeedback(null);
        
        if (currentLives <= 0) {
          // เลือดหมด ตาย! ส่งคะแนนที่คำนวณล่าสุดไปเลย
          finishQuiz(score + earnedScore); 
        } else if (current + 1 < questions.length) {
          setCurrent((c) => c + 1); 
        } else {
          // ตอบครบทุกข้อแล้ว ส่งคะแนนไปเลย
          finishQuiz(score + earnedScore); 
        }
      }, 1000); 
    },
    [current, questions, selected, combo, lives, score] 
  );

  // 🌟 ปรับปรุงใหม่: ไม่ต้องยิง API แล้ว แค่ส่งคะแนนกลับไปให้ App.jsx
  const finishQuiz = (finalScore) => {
    playSound('finish');
    // ส่งข้อมูลเพียวๆ ไปรอไว้ที่หน้า Result
    onFinish({ 
      score: finalScore, 
      total: questions.length * 10 // คะแนนเต็มสมมติฐานที่ข้อละ 10
    });
  };

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
          lives={lives} 
        />
        
        <TimerBar 
          key={current} 
          timeLimit={10} 
          isPaused={selected !== null} 
          onTimeUp={() => handleAnswer(-1, null)} 
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