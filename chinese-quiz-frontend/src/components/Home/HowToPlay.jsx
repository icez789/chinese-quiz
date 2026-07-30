import React from 'react';

function HowToPlay() {
  return (
    <div className="how-to-play-card">
      <h3>🎮 วิธีการเล่น</h3>
      <ul>
        <li>🖼️ ดูรูปภาพที่ปรากฏบนหน้าจอ</li>
        <li>🤔 เลือกคำตอบที่ถูกต้องจาก 4 ตัวเลือก</li>
        <li>✅ ตอบถูกรับ <strong>+10 คะแนน</strong></li>
        <li>❌ ตอบผิดไม่ได้คะแนนนะ!</li>
        <li>🧠 เรียนรู้คำศัพท์ พินอิน และความหมายไปพร้อมกัน</li>
      </ul>
    </div>
  );
}

export default HowToPlay;