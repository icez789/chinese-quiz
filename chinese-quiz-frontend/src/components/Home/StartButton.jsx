import React from 'react';

function StartButton({ onStart }) {
  return (
    <button className="start-button" onClick={onStart}>
      เริ่มเกมเลย! 🚀
    </button>
  );
}

export default StartButton;