import { useState, useEffect } from 'react';
import './CategoryMenu.css';

// 🎨 จับคู่ไอคอนตามความหมายของชื่อหมวดหมู่จริงๆ (เช็คจากคำในชื่อ)
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
    fetch('http://localhost:5000/api/categories')
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

  if (loading) {
    return (
      <div className="category-loading-container">
        <div className="category-spinner"></div>
        <div>กำลังโหลดข้อมูลเซิร์ฟเวอร์...</div>
      </div>
    );
  }

  return (
    <div className="category-container">
      <div className="category-glow"></div>

      <div className="category-header">
        <div className="category-kicker">选择分类</div>
        <h1 className="category-title">เลือกหมวดหมู่คำศัพท์</h1>
      </div>

      {error && <div className="category-error">{error}</div>}

      <div className="category-grid">
        {/* 🌟 ปุ่มพิเศษ: สุ่มมั่วทุกหมวด */}
        <button
          onClick={() => onSelect('all')}
          className="category-card card-random"
          style={{ animationDelay: '0s' }}
        >
          <span className="category-icon">🔀</span>
          <span className="category-name">สุ่มมั่วทุกหมวด</span>
        </button>

        {/* ปุ่มหมวดหมู่ปกติทั้ง 10 หมวด */}
        {categories.map((cat, i) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className="category-card"
            style={{ animationDelay: `${(i + 1) * 0.05}s` }}
          >
            <span className="category-icon">{getCategoryIcon(cat.name_th)}</span>
            <span className="category-name">{cat.name_th}</span>
          </button>
        ))}
      </div>

      <button className="category-back-btn" onClick={onBack}>
        ← กลับหน้าแรก
      </button>
    </div>
  );
}