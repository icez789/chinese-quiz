import { useState, useEffect } from 'react';
import { playSound } from '../../SoundManager';
import './CategoryMenu.css';

// ... (ส่วน ICON_RULES และ getCategoryIcon เหมือนเดิม) ...
const ICON_RULES = [
  { keywords: ['ผลไม้'], icon: '🍎' },
  { keywords: ['ผัก'], icon: '🥬' },
  { keywords: ['สัตว์'], icon: '🐼' },
  { keywords: ['ยานพาหนะ', 'รถ'], icon: '🚗' },
  { keywords: ['อาหาร'], icon: '🍜' },
  { keywords: ['เครื่องดื่ม'], icon: '🥤' },
  { keywords: ['สี'], icon: '🎨' },
  { keywords: ['ร่างกาย'], icon: '🧍' },
  { keywords: ['อาชีพ'], icon: '💼' },
  { keywords: ['สถานที่'], icon: '📍' },
  { keywords: ['ของใช้ในบ้าน', 'บ้าน'], icon: '🏠' },
  { keywords: ['ครอบครัว'], icon: '👨‍👩‍👧' },
  { keywords: ['เสื้อผ้า'], icon: '👕' },
  { keywords: ['กีฬา'], icon: '⚽' },
  { keywords: ['ดนตรี', 'เพลง'], icon: '🎵' },
  { keywords: ['ตัวเลข', 'เลข'], icon: '🔢' },
  { keywords: ['เวลา'], icon: '⏰' },
  { keywords: ['สภาพอากาศ', 'อากาศ'], icon: '☀️' },
  { keywords: ['โรงเรียน', 'การศึกษา'], icon: '🏫' },
  { keywords: ['เทคโนโลยี'], icon: '💻' },
];
const DEFAULT_ICON = '📚';

function getCategoryIcon(name = '') {
  const match = ICON_RULES.find((rule) => rule.keywords.some((kw) => name.includes(kw)));
  return match ? match.icon : DEFAULT_ICON;
}

export default function CategoryMenu({ onSelect, onBack }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => {
        if (!res.ok) throw new Error('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('โหลดหมวดหมู่พัง:', err);
        setError('ไม่สามารถดึงข้อมูลหมวดหมู่ได้ โปรดตรวจสอบ Backend');
        setLoading(false);
      });
  }, []);

  const handleHover = () => playSound('tick');
  const handleClick = (id) => {
    playSound('click');
    onSelect(id);
  };

  if (loading) {
    return (
      <div className="pixel-loading-container">
        <div className="pixel-text">LOADING<span className="blink">_</span></div>
      </div>
    );
  }

  return (
    <div className="pixel-container">
      {/* 🌌 ฉากหลังอวกาศ 3 ชั้น (Parallax Starfield) */}
      <div className="pixel-starfield stars-slow"></div>
      <div className="pixel-starfield stars-medium"></div>
      <div className="pixel-starfield stars-fast"></div>

      {/* 📺 เอฟเฟกต์เส้นหน้าจอ CRT */}
      <div className="crt-scanlines"></div>

      <div className="pixel-main-content">
        <div className="pixel-header">
          <div className="pixel-kicker">SELECT_STAGE</div>
          <h1 className="pixel-title">เลือกหมวดหมู่<span className="blink">_</span></h1>
        </div>

        {error && <div className="pixel-error">ERR: {error}</div>}

        <div className="pixel-grid">
          <button
            onClick={() => handleClick('all')}
            onMouseEnter={handleHover}
            className="pixel-card pixel-random"
          >
            <span className="pixel-icon">🔀</span>
            <span className="pixel-name">สุ่มมั่วทั้งหมด</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleClick(cat.id)}
              onMouseEnter={handleHover}
              className="pixel-card"
            >
              <span className="pixel-icon">{getCategoryIcon(cat.name_th)}</span>
              <span className="pixel-name">{cat.name_th}</span>
            </button>
          ))}
        </div>

        <button className="pixel-back-btn" onClick={() => { playSound('click'); onBack(); }} onMouseEnter={handleHover}>
          [ RETURN_TO_TITLE ]
        </button>
      </div>
    </div>
  );
}