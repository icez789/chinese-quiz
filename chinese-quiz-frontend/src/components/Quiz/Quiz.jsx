import { useState, useEffect, useCallback } from 'react';
import QuestionCard from './QuestionCard';
import ScoreBar from './ScoreBar';
import TimerBar from './TimerBar';
import { playSound, playBGM, stopBGM } from "../../SoundManager";
import { triggerPixelBurst } from '../Home/PixelBurst'; 
import './Quiz.css';

const API_BASE = '';

export default function Quiz({ categoryId, level, onFinish, token }) {
  const MAX_TIME = level === 3 ? 5 : 10;
  const STARTING_LIVES = level === 3 ? 3 : 7;

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null); 
  const [lives, setLives] = useState(STARTING_LIVES);

  const [inventory, setInventory] = useState({});
  const [hiddenChoices, setHiddenChoices] = useState([]); 
  const [isFrozen, setIsFrozen] = useState(false); 

  useEffect(() => {
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

    if (token) {
      fetch('/api/shop/inventory', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setInventory(data.inventory || {}));
    }
  }, [categoryId, token]);

  useEffect(() => {
    if (!loading && questions.length > 0) {
      if (level === 3) playBGM('quiz_hell'); 
      else if (categoryId === 'all') playBGM('quiz_random');
      else playBGM('quiz_normal');
    }
    return () => stopBGM();
  }, [loading, questions.length, level, categoryId]);

  // 🌟 อัปเกรดระบบใช้ไอเทมให้ชัวร์ 100% ว่าหักจากฐานข้อมูลแล้ว
  const handleUseItem = async (itemId) => {
    if (!inventory[itemId] || inventory[itemId] <= 0 || selected !== null) return;
    if (itemId === 'item_5050' && hiddenChoices.length > 0) return;
    if (itemId === 'item_freeze' && isFrozen) return;

    playSound('levelup');
    
    // หักของในหน้าจอไปก่อนเพื่อให้ผู้เล่นรู้สึกว่ากดติดทันที (Optimistic UI)
    setInventory(prev => ({ ...prev, [itemId]: prev[itemId] - 1 }));

    try {
      const res = await fetch('/api/shop/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ item_id: itemId })
      });
      
      if (!res.ok) {
        // ถ้าหลังบ้าน Error (เช่น ของใน DB หมดจริงๆ) ให้คืนค่าของกลับมา
        const errData = await res.json();
        console.error("เซิร์ฟเวอร์ปฏิเสธการใช้ไอเทม:", errData);
        setInventory(prev => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        alert("⚠️ ใช้ไอเทมไม่สำเร็จ: " + (errData.error || "ลองใหม่อีกครั้ง"));
        return;
      }
    } catch (err) {
      console.error("ใช้งานไอเทมไม่สำเร็จ:", err);
      // คืนค่าถ้าเน็ตหลุด
      setInventory(prev => ({ ...prev, [itemId]: prev[itemId] + 1 }));
      return; 
    }

    // ถ้าผ่านหมด ค่อยให้เอฟเฟกต์ทำงาน
    if (itemId === 'item_1up') {
      setLives(l => l + 1);
    } else if (itemId === 'item_freeze') {
      setIsFrozen(true);
      setTimeout(() => setIsFrozen(false), 5000); 
    } else if (itemId === 'item_5050') {
      const correctIdx = questions[current].answer;
      const wrongIndices = [0, 1, 2, 3].filter(i => i !== correctIdx);
      const hide = wrongIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
      setHiddenChoices(hide);
    }
  };

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
        setHiddenChoices([]);
        setIsFrozen(false);
        
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
    stopBGM();
    playSound('finish');
    onFinish({ score: finalScore, total: questions.length * 10 });
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

      {/* 🌟 ย้ายไอเทมมาไว้ที่แผงควบคุมด้านข้าง (ซ้ายมือ) */}
      <div style={sidePanelStyle}>
        <div style={{ color: '#ffd700', fontSize: '10px', marginBottom: '10px', textAlign: 'center' }}>ITEMS</div>
        <button 
          onClick={() => handleUseItem('item_5050')} 
          disabled={!inventory['item_5050'] || hiddenChoices.length > 0 || selected !== null}
          style={{ ...sideBtnStyle, opacity: inventory['item_5050'] ? 1 : 0.4 }}
        >
          <span style={{ fontSize: '18px' }}>💡</span>
          <span>50/50</span>
          <span style={{ color: '#00f2fe' }}>x{inventory['item_5050'] || 0}</span>
        </button>
        <button 
          onClick={() => handleUseItem('item_freeze')} 
          disabled={!inventory['item_freeze'] || isFrozen || selected !== null}
          style={{ ...sideBtnStyle, opacity: inventory['item_freeze'] ? 1 : 0.4, borderColor: isFrozen ? '#00f2fe' : '#555' }}
        >
          <span style={{ fontSize: '18px' }}>⏱️</span>
          <span>FREEZE</span>
          <span style={{ color: '#00f2fe' }}>x{inventory['item_freeze'] || 0}</span>
        </button>
        <button 
          onClick={() => handleUseItem('item_1up')} 
          disabled={!inventory['item_1up'] || selected !== null}
          style={{ ...sideBtnStyle, opacity: inventory['item_1up'] ? 1 : 0.4 }}
        >
          <span style={{ fontSize: '18px' }}>❤️</span>
          <span>1-UP</span>
          <span style={{ color: '#00f2fe' }}>x{inventory['item_1up'] || 0}</span>
        </button>
      </div>

      <div className="pixel-quiz-content">
        <ScoreBar
          score={score}
          combo={combo}
          current={current + 1}
          total={questions.length}
          lives={lives} 
          maxLives={STARTING_LIVES} 
        />

        <TimerBar 
          key={current} 
          timeLimit={MAX_TIME} 
          isPaused={selected !== null || isFrozen} 
          onTimeUp={() => handleAnswer(-1, null)} 
        />

        <QuestionCard
          question={questions[current]}
          selected={selected}
          feedback={feedback}
          onAnswer={handleAnswer}
          hiddenChoices={hiddenChoices} 
        />
      </div>
    </div>
  );
}

// 🌟 สไตล์สำหรับแผงด้านข้าง และ ปุ่มแนวตั้ง
const sidePanelStyle = {
  position: 'fixed',
  left: '20px',        // แปะไว้ฝั่งซ้าย (เพราะขวามีปุ่ม Profile ขวางอยู่)
  top: '50%',          // ให้อยู่กึ่งกลางจอแนวตั้ง
  transform: 'translateY(-50%)', 
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  backgroundColor: 'rgba(0,0,0,0.7)', // ทำพื้นหลังโปร่งแสงนิดๆ ให้ดูเป็นกรอบ
  padding: '15px',
  border: '2px solid #333',
  borderRadius: '8px',
  zIndex: 50,
  boxShadow: '4px 4px 0px rgba(0,0,0,0.8)'
};

const sideBtnStyle = {
  backgroundColor: '#111', 
  color: '#fff', 
  border: '2px solid #555',
  padding: '10px 5px', 
  fontFamily: "'Press Start 2P', monospace",
  fontSize: '9px', 
  cursor: 'pointer', 
  borderRadius: '4px',
  display: 'flex',
  flexDirection: 'column', // เรียงไอคอนกับตัวหนังสือเป็นแนวตั้ง
  alignItems: 'center',
  gap: '6px',
  width: '70px'
};