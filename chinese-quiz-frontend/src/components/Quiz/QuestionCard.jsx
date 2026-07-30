import React from 'react';
import ArcadeButton from '../Common/ArcadeButton'; // 🔧 Import ปุ่มที่เราแยกไว้ออกมาใช้

export default function QuestionCard({ question, selected, feedback, onAnswer }) {
  const emojiStr = question.image_url; 

  return (
    <div className="question-card">
      
      {/* โชว์อีโมจิเด้งดึ๋ง */}
      <div className="arcade-emoji">
        {emojiStr}
      </div>

      <h2 className="question-text">{question.question}</h2>

      <div className="choices-grid">
        {question.choices.map((choice, i) => {
          
          // เช็คสถานะของปุ่มแต่ละปุ่มว่าควรแสดงผลเป็นอะไร (ถูก, ผิด, หรือปกติ)
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
              onClick={() => onAnswer(i)}
            />
          );
        })}
      </div>
    </div>
  );
}