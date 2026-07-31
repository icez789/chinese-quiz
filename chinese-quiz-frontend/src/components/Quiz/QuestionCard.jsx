import React from 'react';
import { triggerPixelBurst } from '../Home/PixelBurst'; 
import ArcadeButton from '../Common/ArcadeButton'; 

export default function QuestionCard({ question, selected, feedback, onAnswer }) {
  const emojiStr = question.image_url; // ตัวแปรนี้คือ Emoji ของเรา!

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

          return (
            <ArcadeButton
              key={i}
              text={choice}
              index={i}
              btnState={btnState}
              disabled={selected !== null}
              onClick={(e) => onAnswer(i, e)} 
            />
          );
        })}
      </div>
    </div>
  );
}