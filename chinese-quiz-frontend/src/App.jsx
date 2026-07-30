import { useState } from 'react';
import Home from './components/Home/Home';
import Quiz from './components/Quiz/Quiz';
import ResultScreen from './components/Result/ResultScreen';
// 🔧 Import หน้าเลือกหมวดหมู่ที่เราเพิ่งแยกไฟล์ออกไปเข้ามา
import CategoryMenu from './components/Category/CategoryMenu';

export default function App() {
  const [screen, setScreen] = useState('home'); 
  const [result, setResult] = useState(null);
  const [categoryId, setCategoryId] = useState(1); 
  const userId = 1; 

  return (
    <>
      {screen === 'home' && (
        <Home onStart={() => setScreen('category')} />
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
            setResult(res);
            setScreen('result');
          }}
        />
      )}

      {screen === 'result' && (
        <ResultScreen
          result={result}
          onRetry={() => setScreen('quiz')} 
          onHome={() => setScreen('home')}
        />
      )}
    </>
  );
}