import React from 'react';
import { triggerPixelBurst } from '../Home/PixelBurst'; 
import ArcadeButton from '../Common/ArcadeButton'; 

// 🌟 1. เพิ่ม hiddenChoices = [] เข้ามาในวงเล็บ Props
export default function QuestionCard({ question, selected, feedback, onAnswer, hiddenChoices = [] }) {
  const emojiStr = question.image_url; 

  return (
    <div className="pixel-question-card">
      
      {/* 📺 กรอบทีวีจอแก้ว โชว์ Emoji ตัวเบ้อเริ่ม */}
      <div className="pixel-image-frame">
        <div className="arcade-emoji">{emojiStr}</div>
      </div>

      <h2 className="pixel-question-text">{question.question}</h2>

      <div className="pixel-choices-grid">
        {question.choices.map((choice, i) => {
          let btnState = null;
          if (selected !== null) {
            if (i === question.answer) btnState = 'correct';
            else if (i === selected) btnState = 'wrong';
          }

          // 🌟 2. เช็คว่าข้อนี้ตรงกับเป้าหมายที่ไอเทม 50/50 สุ่มตัดทิ้งหรือไม่
          const isHidden = hiddenChoices.includes(i);

          return (
            // 🌟 3. ครอบด้วย div แล้วใช้ visibility: hidden เพื่อให้ปุ่มล่องหน (แต่ยังจองพื้นที่ไว้)
            <div key={i} style={{ visibility: isHidden ? 'hidden' : 'visible', width: '100%', height: '100%' }}>
              <ArcadeButton
                text={choice}
                index={i}
                btnState={btnState}
                disabled={selected !== null || isHidden} /* 🌟 ปิดการกดถ้าปุ่มโดนซ่อน */
                onClick={(e) => onAnswer(i, e)} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}