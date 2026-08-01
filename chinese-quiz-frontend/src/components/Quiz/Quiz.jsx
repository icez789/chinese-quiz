import { useState, useEffect, useCallback } from 'react';
import QuestionCard from './QuestionCard';
import ScoreBar from './ScoreBar';
import TimerBar from './TimerBar';
import { playSound } from "../../SoundManager";
import { triggerPixelBurst } from '../Home/PixelBurst'; 
import './Quiz.css';

const API_BASE = '';

export default function Quiz({ categoryId, level, onFinish }) {
  // 🌟 ตั้งค่าความโหด: ถ้า level 3 (Hell Mode) ให้เวลา 5 วิ หัวใจ 3 ดวง / โหมดปกติ 10 วิ หัวใจ 7 ดวง
  const MAX_TIME = level === 3 ? 5 : 10;
  const STARTING_LIVES = level === 3 ? 3 : 7;

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null); 
  
  // 🌟 ให้หัวใจเริ่มต้นตามโหมดที่เล่น
  const [lives, setLives] = useState(STARTING_LIVES);

  useEffect(() => {
    // 🌟 บังคับดึงคำศัพท์ level=1 เสมอ ตามที่มีใน Database!
    let fetchUrl = `${API_BASE}/api/words?level=1&limit=10`;
    if (categoryId !== 'all' && categoryId !== 0) {
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
  }, [categoryId]); // เอา level ออกจากตรงนี้เพราะเราฟิกซ์ดึงแต่ level=1 เสมอ

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
          finishQuiz(score + earnedScore); 
        } else if (current + 1 < questions.length) {
          setCurrent((c) => c + 1); 
        } else {
          finishQuiz(score + earnedScore); 
        }
      }, 1000); 
    },
    [current, questions, selected, combo, lives, score] 
  );

  const finishQuiz = (finalScore) => {
    playSound('finish');
    onFinish({ 
      score: finalScore, 
      total: questions.length * 10 
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
          maxLives={STARTING_LIVES} // 🌟 แอบส่งจำนวนหัวใจสูงสุดไปให้ ScoreBar เผื่อนำไปใช้
        />
        
        <TimerBar 
          key={current} 
          timeLimit={MAX_TIME} // 🌟 เปลี่ยนเวลาจำกัดให้ตรงกับโหมด (5 หรือ 10)
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