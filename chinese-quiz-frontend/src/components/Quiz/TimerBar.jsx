import React, { useState, useEffect } from 'react';

export default function TimerBar({ timeLimit, isPaused, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isPaused]);

  useEffect(() => {
    if (timeLeft === 0 && !isPaused) {
      onTimeUp();
    }
  }, [timeLeft, isPaused, onTimeUp]);

  // คำนวณเปอร์เซ็นต์และสีหลอด
  const percentage = (timeLeft / timeLimit) * 100;
  let barColor = 'var(--pixel-green)';
  if (percentage <= 50) barColor = 'var(--pixel-yellow)';
  if (percentage <= 20) barColor = 'var(--pixel-red)';

  return (
    <div className="pixel-timer-container">
      <div className="pixel-timer-label">TIME</div>
      <div className="pixel-timer-track">
        <div 
          className="pixel-timer-fill" 
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        ></div>
      </div>
    </div>
  );
}