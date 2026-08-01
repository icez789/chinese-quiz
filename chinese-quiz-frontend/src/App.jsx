import { useState, useContext } from 'react';
import { AuthContext } from './AuthContext'; // 🌟 1. ดึง Context เข้ามา
import LoginScreen from './components/Auth/LoginScreen'; // 🌟 2. ดึงหน้าจอ Login เข้ามา

import Home from './components/Home/Home';
import Quiz from './components/Quiz/Quiz';
import ResultScreen from './components/Result/ResultScreen';
import CategoryMenu from './components/Category/CategoryMenu';
import Leaderboard from './components/Leaderboard/Leaderboard'; 
// ❌ เอา NameEntry ออกไปได้เลยครับ เราไม่ต้องใช้แล้ว!
import Profile from './components/Profile/Profile';
import { playSound } from './SoundManager'; // ปรับ Path ให้ตรงกับโฟลเดอร์ที่ไฟล์นี้อยู่ด้วยนะครับ (เช่น './SoundManager')

export default function App() {
  // 🌟 3. ดึงสถานะผู้ใช้และ Token มาจากระบบ
  const { user, token, logout, isLoading } = useContext(AuthContext);

  const [screen, setScreen] = useState('home'); 
  const [result, setResult] = useState(null); 
  const [categoryId, setCategoryId] = useState(1); 

  // 🌟 4. ฉากโหลด: ถ้าแอปกำลังเช็ค Token อยู่หลังบ้าน ให้โชว์หน้านี้
  if (isLoading) {
    return (
      <div style={{ backgroundColor: '#030303', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#39ff14', fontFamily: "'Press Start 2P', monospace" }}>
        <h2 className="blink">SYSTEM_INITIALIZING...</h2>
      </div>
    );
  }

  // 🌟 5. ด่านตรวจ: ถ้ายังไม่ได้ล็อกอิน ให้เอา LoginScreen มาขวางไว้เลย
  if (!user) {
    return <LoginScreen onLoginSuccess={() => setScreen('home')} />;
  }

  // 🌟 6. ฟังก์ชันบันทึกคะแนนฉบับใหม่ (แนบ Token ยิงตรงเข้า Database เลย)
  const handleSaveScore = async () => {
    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // แนบบัตรผ่านไปกับ Request!
        },
        body: JSON.stringify({
          category_id: categoryId === 'all' ? 0 : categoryId,
          score: result?.score || 0,
          total_questions: result?.total || 10
        }),
      });
      
      if (!res.ok) throw new Error('บันทึกคะแนนไม่สำเร็จ');
      
      console.log('บันทึกข้อมูลลงฐานข้อมูลเรียบร้อย!');
    } catch (err) {
      console.error(err);
    } finally {
      // เสร็จแล้วเด้งไปหน้า Leaderboard
      setScreen('leaderboard'); 
    }
  };

  return (
    <>
      {/* 🌟 7. เพิ่ม UI บอกชื่อผู้เล่นและปุ่ม Logout มุมขวาบนของจอ */}
      <div style={{ position: 'absolute', top: 15, right: 20, zIndex: 100, color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}>
        PLAYER: <span style={{ color: 'var(--pixel-green, #39ff14)' }}>{user.username}</span> 

        {/* 🌟 ปุ่มเข้าหน้า Profile */}
        <button 
          onClick={() => { playSound('click'); setScreen('profile'); }} 
          style={{ marginLeft: '15px', background: 'transparent', border: '2px solid var(--pixel-blue, #00f2fe)', color: 'var(--pixel-blue, #00f2fe)', cursor: 'pointer', padding: '5px 10px', fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}
        >
          PROFILE
        </button>

        <button 
          onClick={logout} 
          style={{ marginLeft: '15px', background: 'transparent', border: '2px solid var(--pixel-red, #ff2a2a)', color: 'var(--pixel-red, #ff2a2a)', cursor: 'pointer', padding: '5px 10px', fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}
        >
          LOGOUT
        </button>
      </div>

      {screen === 'home' && (
        <Home 
          onStart={() => setScreen('category')} 
          onLeaderboard={() => setScreen('leaderboard')} 
        />
      )}

      {screen === 'leaderboard' && (
        <Leaderboard 
          onHome={() => setScreen('home')} 
        />
      )}

      {screen === 'category' && (
        <CategoryMenu 
          onSelect={(id) => {
            setCategoryId(id);
            setScreen('quiz');
          }}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'quiz' && (
        <Quiz
          // ❌ ไม่ต้องส่ง userId แล้ว เพราะ Backend ดึงจาก Token ได้เอง
          categoryId={categoryId}
          level={1}
          onFinish={(res) => {
            setResult(res); 
            setScreen('result');
          }}
        />
      )}

      {screen === 'result' && (
        <ResultScreen
          result={result}
          onRetry={() => setScreen('category')} 
          onHome={() => setScreen('home')}
          // 🌟 พอกดปุ่ม SAVE SCORE ให้เรียกใช้ฟังก์ชันยิงคะแนนได้เลย
          onSave={handleSaveScore} 
        />
      )}

      {screen === 'profile' && (
        <Profile onBack={() => setScreen('home')} />
      )}

    </>
  );
}