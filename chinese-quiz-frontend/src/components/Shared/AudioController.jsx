import React, { useState, useEffect } from 'react';
import { setGlobalVolume, toggleMute, playSound } from '../../SoundManager'; // ระบุ Path ให้ตรงกับที่คุณเก็บไฟล์ไว้

export default function AudioController() {
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);

  // เมื่อค่า State เปลี่ยน ให้ส่งค่าไปให้ SoundManager
  useEffect(() => {
    setGlobalVolume(volume / 100);
  }, [volume]);

  useEffect(() => {
    toggleMute(isMuted);
  }, [isMuted]);

  const handleVolDown = () => {
    playSound('tick');
    if (isMuted) setIsMuted(false);
    setVolume((prev) => Math.max(0, prev - 10));
  };

  const handleVolUp = () => {
    playSound('tick');
    if (isMuted) setIsMuted(false);
    setVolume((prev) => Math.min(100, prev + 10));
  };

  const handleMuteToggle = () => {
    playSound('tick');
    setIsMuted(!isMuted);
  };

  return (
    <div style={styles.container}>
      <span style={styles.label}>
        {isMuted ? '🔇 MUTE' : `🔊 VOL: ${volume}%`}
      </span>
      <div style={styles.btnGroup}>
        <button style={styles.btn} onClick={handleVolDown}>-</button>
        <button style={styles.btn} onClick={handleMuteToggle}>
          {isMuted ? 'UNMUTE' : 'MUTE'}
        </button>
        <button style={styles.btn} onClick={handleVolUp}>+</button>
      </div>
    </div>
  );
}

// 🌟 เขียน Style ในตัวไปเลย จะได้ไม่ต้องสร้างไฟล์ CSS แยกให้รก
const styles = {
  container: {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    zIndex: 9999,
    backgroundColor: '#000',
    border: '2px solid #555',
    padding: '10px 15px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    fontFamily: "'Press Start 2P', monospace",
    boxShadow: '4px 4px 0px #111',
  },
  label: {
    color: '#00f2fe',
    fontSize: '10px',
  },
  btnGroup: {
    display: 'flex',
    gap: '5px',
  },
  btn: {
    backgroundColor: '#111',
    color: '#fff',
    border: '2px solid #333',
    padding: '5px 8px',
    fontSize: '10px',
    fontFamily: "'Press Start 2P', monospace",
    cursor: 'pointer',
  }
};