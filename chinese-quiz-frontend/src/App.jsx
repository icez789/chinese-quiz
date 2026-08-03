import { useState, useContext } from 'react';
import { AuthContext } from './AuthContext'; 
import LoginScreen from './components/Auth/LoginScreen'; 
import Home from './components/Home/Home';
import Quiz from './components/Quiz/Quiz';
import ResultScreen from './components/Result/ResultScreen';
import CategoryMenu from './components/Category/CategoryMenu';
import Leaderboard from './components/Leaderboard/Leaderboard'; 
import Profile from './components/Profile/Profile';
import { playSound } from './SoundManager'; 
import AudioController from './components/Shared/AudioController'; // ปรับ Path ตามที่คุณสร้าง
import Shop from './components/Shop/Shop'; // 🌟 ปรับ Path ให้ตรงกับโฟลเดอร์ที่คุณเซฟไว้
import Dictionary from './components/Dictionary/Dictionary'; // 🌟 ปรับ Path ให้ตรง
import BossBattle from './components/BossBattle/BossBattle';

export default function App() {
  const { user, token, logout, isLoading } = useContext(AuthContext);

  const [screen, setScreen] = useState('home'); 
  const [result, setResult] = useState(null); 
  const [categoryId, setCategoryId] = useState(1); 
  // 🌟 เพิ่ม State ควบคุมความยาก (Level) 
  const [gameLevel, setGameLevel] = useState(1); 

  if (isLoading) {
    return (
      <div style={{ backgroundColor: '#030303', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#39ff14', fontFamily: "'Press Start 2P', monospace" }}>
        <h2 className="blink">SYSTEM_INITIALIZING...</h2>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLoginSuccess={() => setScreen('home')} />;
  }

  const handleSaveScore = async () => {
    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
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
      setScreen('leaderboard'); 
    }
  };

  return (
    <>
      <AudioController />
      <div style={{ position: 'absolute', top: 15, right: 20, zIndex: 100, color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}>
        PLAYER: <span style={{ color: 'var(--pixel-green, #39ff14)' }}>{user.username}</span> 

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
          onShop={() => setScreen('shop')} 
          onDictionary={() => setScreen('dictionary')}
          onBossBattle={() => setScreen('boss')} /* 🌟 เพิ่มทางเข้าโหมดบอส */
        />
      )}

      {screen === 'shop' && (
        <Shop 
          onBack={() => setScreen('home')} 
          token={token} 
        />
      )}

      {screen === 'dictionary' && (
        <Dictionary onBack={() => setScreen('home')} />
      )}

      {screen === 'leaderboard' && (
        <Leaderboard 
          onHome={() => setScreen('home')} 
        />
      )}

      {screen === 'category' && (
        <CategoryMenu 
          onSelect={(id) => {
            if (id === 'hell') {
              setCategoryId('all'); 
              setGameLevel(3); 
            } else {
              setCategoryId(id);
              setGameLevel(1); 
            }
            setScreen('quiz');
          }}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'quiz' && (
        <Quiz
          categoryId={categoryId}
          level={gameLevel} 
          token={token} /* 🌟 เพิ่ม Token ส่งไปให้ Quiz ใช้งานไอเทมที่นี่! */
          onFinish={(res) => {
            setResult(res); 
            setScreen('result');
          }}
        />
      )}

      {screen === 'boss' && (
        <BossBattle
          token={token}
          onFinish={(res) => {
            // โหมดบอสจะส่งค่า { score, status } กลับมา
            setResult({
              score: res.score,
              total: 10, // ตีซะว่าบอสเลือด 100 ต้องตอบ 10 ข้อ
              isBossMode: true, // 🌟 แปะป้ายบอกหน้า Result ว่านี่คือโหมดบอสนะ
              status: res.status // 'VICTORY' หรือ 'DEFEAT'
            }); 
            setScreen('result');
          }}
        />
      )}

      {screen === 'result' && (
        <ResultScreen
          result={result}
          onRetry={() => setScreen('category')} 
          onHome={() => setScreen('home')}
          onSave={handleSaveScore} 
        />
      )}

      {screen === 'profile' && (
        <Profile onBack={() => setScreen('home')} />
      )}
    </>
  );
}