import { useState } from 'react';
import Home from './components/Home/Home';
import Quiz from './components/Quiz/Quiz';
import ResultScreen from './components/Result/ResultScreen';
import CategoryMenu from './components/Category/CategoryMenu';
import Leaderboard from './components/Leaderboard/Leaderboard'; 
import NameEntry from './components/Leaderboard/NameEntry';

export default function App() {
  const [screen, setScreen] = useState('home'); 
  const [result, setResult] = useState(null); // 🌟 เราใช้ตัวแปรนี้เก็บคะแนน
  const [categoryId, setCategoryId] = useState(1); 
  const userId = 1; 

  return (
    <>
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
          userId={userId}
          categoryId={categoryId}
          level={1}
          onFinish={(res) => {
            setResult(res); // เซ็ตค่าใส่ result
            setScreen('result');
          }}
        />
      )}

      {/* 🌟 ยุบหน้า ResultScreen มารวมกัน และแก้ใช้ตัวแปร result */}
      {screen === 'result' && (
        <ResultScreen
          result={result}
          onRetry={() => setScreen('category')} 
          onHome={() => setScreen('home')}
          onSave={() => setScreen('name-entry')} 
        />
      )}

      {/* 🌟 แก้ไข: ดึงคะแนนจาก result (ป้องกันกรณี null ด้วย ?.) */}
      {screen === 'name-entry' && (
        <NameEntry 
          score={result?.score || 0} 
          onSubmit={(name, score) => {
            console.log(`เตรียมส่งชื่อ ${name} พร้อมคะแนน ${score} ขึ้น Backend!`);
            
            // TODO: โค้ดยิง API บันทึกลง Database
            
            // บันทึกเสร็จ เด้งไปหน้า Leaderboard
            setScreen('leaderboard'); 
          }}
        />
      )}
    </>
  );
}