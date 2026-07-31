import React from 'react';
import './ArcadeButton.css'; // 🌟 อย่าลืม import CSS

export default function ArcadeButton({ text, index, btnState, disabled, onClick }) {
  // เช็คว่าปุ่มนี้ถูก, ผิด, หรือปกติ
  let className = "arcade-btn";
  if (btnState === 'correct') className += " correct";
  if (btnState === 'wrong') className += " wrong";

  return (
    <button className={className} disabled={disabled} onClick={onClick}>
      <span className="arcade-btn-number">{index + 1}.</span> 
      <span className="arcade-btn-text">{text}</span>
    </button>
  );
}