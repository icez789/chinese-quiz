import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../AuthContext'; // ปรับ Path ให้ตรง
import { playSound, playBGM } from '../../SoundManager'; // ปรับ Path ให้ตรง

export default function Dictionary({ onBack }) {
  const { token } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [words, setWords] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    playBGM('category'); // ใช้เพลงชิลๆ 

    const fetchDictionary = async () => {
      try {
        const res = await fetch('/api/dictionary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories);
          setWords(data.words);
          // ตั้งค่าให้แสดงหมวดหมู่แรกสุดเป็นค่าเริ่มต้น
          if (data.categories.length > 0) {
            setActiveCategory(data.categories[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDictionary();
  }, [token]);

  const handleHover = () => playSound('tick');
  const handleTabClick = (catId) => {
    playSound('click');
    setActiveCategory(catId);
  };

  if (loading) {
    return (
      <div className="pixel-loading-container">
        <div className="pixel-text">LOADING_LIBRARY<span className="blink">_</span></div>
      </div>
    );
  }

  // กรองคำศัพท์เฉพาะหมวดหมู่ที่เลือก
  const filteredWords = words.filter(w => w.category_id === activeCategory);

  return (
    <div className="pixel-container">
      <div className="pixel-starfield stars-slow"></div>
      <div className="pixel-starfield stars-medium"></div>
      <div className="pixel-starfield stars-fast"></div>
      <div className="crt-scanlines"></div>

      <div className="pixel-main-content" style={{ maxWidth: '900px', width: '90%' }}>
        <div className="pixel-header">
          <div className="pixel-kicker">DATABASE // ARCHIVE</div>
          <h1 className="pixel-title">คลังคำศัพท์<span className="blink">_</span></h1>
        </div>

        {/* 🌟 แถบเลือกหมวดหมู่ (Tabs) */}
        <div style={tabContainerStyle}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleTabClick(cat.id)}
              onMouseEnter={handleHover}
              style={{
                ...tabStyle,
                backgroundColor: activeCategory === cat.id ? '#e91e63' : '#222',
                color: activeCategory === cat.id ? '#fff' : '#00f2fe',
                borderColor: activeCategory === cat.id ? '#fff' : '#00f2fe',
              }}
            >
              {cat.name_th}
            </button>
          ))}
        </div>

        {/* 🌟 กริดแสดงคำศัพท์ */}
        <div style={wordGridStyle}>
          {filteredWords.map(word => (
            <div key={word.id} className="pixel-card" style={wordCardStyle}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>{word.image_url}</div>
              <div style={{ color: '#39ff14', fontSize: '20px', marginBottom: '5px' }}>{word.chinese}</div>
              <div style={{ color: '#ffd700', fontSize: '12px', marginBottom: '10px' }}>{word.pinyin}</div>
              <div style={{ color: '#fff', fontSize: '14px' }}>{word.thai}</div>
            </div>
          ))}
          {filteredWords.length === 0 && (
            <div style={{ color: '#aaa', marginTop: '20px' }}>NO DATA FOUND.</div>
          )}
        </div>

        <button 
          className="pixel-back-btn" 
          onClick={() => { playSound('click'); onBack(); }} 
          onMouseEnter={handleHover}
          style={{ marginTop: '30px' }}
        >
          [ RETURN_TO_HQ ]
        </button>
      </div>
    </div>
  );
}

// Inline Styles แบบย่อสำหรับหน้าสมุดคำศัพท์
const tabContainerStyle = {
  display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '20px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.5)', border: '2px solid #555', borderRadius: '8px'
};
const tabStyle = {
  padding: '8px 12px', fontFamily: "'Press Start 2P', monospace", fontSize: '10px', cursor: 'pointer', borderWidth: '2px', borderStyle: 'solid', borderRadius: '4px'
};
const wordGridStyle = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px', maxHeight: '50vh', overflowY: 'auto', padding: '10px'
};
const wordCardStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px', backgroundColor: 'rgba(0, 242, 254, 0.1)', border: '2px solid #00f2fe', transition: 'transform 0.1s'
};