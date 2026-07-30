import { useState, useEffect, useCallback } from 'react';
import QuestionCard from './QuestionCard';
import ScoreBar from './ScoreBar';
import TimerBar from './TimerBar'; // 🔧 Import ตัวหลอดเวลาเข้ามา
import { playSound } from "../../SoundManager";
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
    (choiceIndex) => {
      if (selected !== null) return; 
      
      const q = questions[current];
      const isCorrect = choiceIndex === q.answer;

      setSelected(choiceIndex);
      setFeedback(isCorrect ? 'correct' : 'wrong');
      playSound(isCorrect ? 'correct' : 'wrong');

      if (isCorrect) {
        const bonus = combo >= 3 ? 15 : 10; 
        setScore((s) => s + bonus);
        setCombo((c) => c + 1);
      } else {
        setCombo(0);
      }

      setTimeout(() => {
        setSelected(null);
        setFeedback(null);
        
        if (current + 1 < questions.length) {
          setCurrent((c) => c + 1);
        } else {
          finishQuiz();
        }
      }, 1000); 
    },
    [current, questions, selected, combo]
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

  if (loading) return <div className="quiz-loading">กำลังโหลดคำถาม...</div>;
  if (!questions.length) return <div className="quiz-loading">ไม่พบคำถามในหมวดนี้</div>;

  return (
    <div className="quiz-container">
      <ScoreBar
        score={score}
        combo={combo}
        current={current + 1}
        total={questions.length}
      />
      
     {/* ⏱️ เรียกใช้ TimerBar พร้อมใส่ key */}
      <TimerBar 
        key={current} // 🌟 หัวใจสำคัญอยู่ตรงนี้! พอ current เปลี่ยน Timer จะถูกสร้างใหม่เอี่ยมทันที
        timeLimit={10} 
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
  );
}