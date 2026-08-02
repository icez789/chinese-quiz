import { useState, useEffect } from 'react';
// 🌟 1. นำเข้า playBGM เข้ามาเพิ่ม
import { playSound, playBGM } from '../../SoundManager';
import './CategoryMenu.css';

// 🌟 อัปเดต ICON_RULES เพิ่มคำค้นหาให้ครอบคลุมหมวดหมู่พื้นฐานทั้งหมด
const ICON_RULES = [
  { keywords: ['ผลไม้'], icon: '🍎' },
  { keywords: ['ผัก'], icon: '🥬' },
  { keywords: ['สัตว์'], icon: '🐼' },
  { keywords: ['ยานพาหนะ', 'รถ'], icon: '🚗' },
  { keywords: ['อาหาร'], icon: '🍜' },
  { keywords: ['เครื่องดื่ม'], icon: '🥤' },
  { keywords: ['สี'], icon: '🎨' },
  { keywords: ['ร่างกาย', 'อวัยวะ'], icon: '🧍' },
  { keywords: ['อาชีพ'], icon: '💼' },
  { keywords: ['สถานที่'], icon: '📍' },
  { keywords: ['ของใช้ในบ้าน', 'บ้าน', 'สิ่งของ'], icon: '🏠' },
  { keywords: ['ครอบครัว', 'ญาติ'], icon: '👨‍👩‍👧' },
  { keywords: ['เสื้อผ้า', 'เครื่องแต่งกาย'], icon: '👕' },
  { keywords: ['กีฬา'], icon: '⚽' },
  { keywords: ['ดนตรี', 'เพลง', 'เครื่องดนตรี'], icon: '🎵' },
  { keywords: ['ตัวเลข', 'เลข'], icon: '🔢' },
  { keywords: ['เวลา', 'วัน', 'เดือน', 'ฤดู'], icon: '⏰' },
  { keywords: ['สภาพอากาศ', 'อากาศ', 'ธรรมชาติ'], icon: '☀️' },
  { keywords: ['โรงเรียน', 'การศึกษา', 'เครื่องเขียน'], icon: '🏫' },
  { keywords: ['เทคโนโลยี', 'ไอที'], icon: '💻' },
  { keywords: ['กริยา', 'การกระทำ'], icon: '🏃' },
  { keywords: ['ความรู้สึก', 'อารมณ์'], icon: '❤️' },
  { keywords: ['ทิศทาง', 'ตำแหน่ง'], icon: '🧭' },
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

  // 🌟 2. เพิ่ม useEffect สำหรับรันเพลง BGM ทันทีที่เข้ามาหน้านี้
  useEffect(() => {
    playBGM('category');
  }, []);

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
          
          {/* 🔀 ปุ่มสุ่มมั่วทั้งหมด */}
          <button
            onClick={() => handleClick('all')}
            onMouseEnter={handleHover}
            className="pixel-card pixel-random"
          >
            <span className="pixel-icon">🔀</span>
            <span className="pixel-name">สุ่มมั่วทั้งหมด</span>
          </button>

          {/* 🔥 ปุ่ม HELL MODE */}
          <button
            onClick={() => handleClick('hell')}
            onMouseEnter={handleHover}
            className="pixel-card pixel-hell"
          >
            <span className="pixel-icon">🔥</span>
            <span className="pixel-name">นรกแตก</span>
          </button>

          {/* 📚 หมวดหมู่ที่ดึงมาจาก Database */}
          {categories
            .filter((cat) => cat.id !== 0) /* 🌟 จุดแก้ไข: กรองเอา ID 0 ทิ้งไป ไม่ให้มาโชว์ซ้ำ! */
            .map((cat) => (
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