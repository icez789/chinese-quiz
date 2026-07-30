import React from 'react';

export default function ArcadeButton({ text, index, btnState, disabled, onClick }) {
  // btnState รับค่า: null (ยังไม่กด), 'correct' (ข้อที่ถูก), 'wrong' (ข้อที่กดผิด)
  
  // แจกแจงสีตาม index: 0=แดง, 1=น้ำเงิน, 2=เขียว, 3=เหลือง
  let className = `arcade-btn btn-color-${index}`;
  
  // จัดการสถานะเวลาเฉลยคำตอบ
  if (btnState === 'correct') {
    className += ' correct';
  } else if (btnState === 'wrong') {
    className += ' wrong';
  }

  return (
    <button
      className={className}
      disabled={disabled}
      onClick={onClick}
    >
      {text}
    </button>
  );
}