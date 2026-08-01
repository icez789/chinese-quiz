import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../AuthContext';
import { playSound } from '../../SoundManager';
// 🌟 ดึงเอฟเฟกต์ระเบิดมาใช้ (ปรับ path ให้ตรงกับไฟล์ของคุณด้วยนะ)
import { triggerPixelBurst } from '../Home/PixelBurst'; 
import './LoginScreen.css';

export default function LoginScreen({ onLoginSuccess }) {
  const { login } = useContext(AuthContext);
  const [isRegister, setIsRegister] = useState(false);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🌟 เปิดระบบคลิกแล้วระเบิด + ปลุกเสียงให้ทำงานตั้งแต่หน้านี้เลย
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (typeof triggerPixelBurst === 'function') triggerPixelBurst(e);
      playSound('wakeup'); 
    };
    
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    playSound('click');

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    
    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
      }

      if (isRegister) {
        setIsRegister(false);
        setPassword('');
        setError('REGISTER SUCCESS! PLEASE LOGIN.');
        playSound('levelup'); // เสียงตอนสมัครผ่าน
      } else {
        login(data.token, data.user);
        playSound('start'); // เสียงตอนเข้าเกมได้
        setTimeout(() => {
          onLoginSuccess();
        }, 500);
      }
    } catch (err) {
      setError(err.message);
      playSound('wrong'); // เสียงตอนพิมพ์รหัสผิด
    } finally {
      setLoading(false);
    }
  };

  const handleHover = () => playSound('tick');

  // 🌟 อัปเกรดฟังก์ชันสลับโหมดให้เสียงดังฟังชัดขึ้น
  const toggleMode = (e) => {
    e.preventDefault(); // กันฟอร์มเด้ง
    playSound('click'); // เปลี่ยนจาก tick เป็น click จะได้ฟีลลิ่งปุ่มกด
    setIsRegister(!isRegister);
    setError('');
  };

  // 🌟 กำหนดคลาส CSS ตามโหมด (Login = ฟ้า, Register = ชมพู)
  const themeClass = isRegister ? 'theme-register' : 'theme-login';

  return (
    <div className="pixel-login-wrapper">
      {/* เอฟเฟกต์เส้น CRT ทับจอ */}
      <div className="crt-scanlines"></div>
      
      {/* 🌟 กล่อง Card ที่เปลี่ยนสีได้ */}
      <div className={`pixel-login-card ${themeClass}`}>
        
        {/* หัวข้อบังคับให้อยู่บรรทัดเดียว */}
        <h1 className="pixel-login-title">
          <span className="blink-fast">[ </span>
          {isRegister ? 'SYSTEM_REGISTER' : 'SYSTEM_LOGIN'}
          <span className="blink-fast"> ]</span>
        </h1>
        
        <form onSubmit={handleSubmit} className="pixel-login-form">
          <div className="input-group">
            <label>_USERNAME:</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value.toUpperCase())}
              maxLength={10}
              placeholder="MAX 10 CHARS"
              required
            />
          </div>
          
          <div className="input-group">
            <label>_PASSWORD:</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>

          {error && (
            <div className={`login-message ${error.includes('SUCCESS') ? 'text-green' : 'text-red'}`}>
              <span className="blink-fast">⚠</span> {error}
            </div>
          )}

          <div className="login-actions">
            <button 
              type="submit" 
              className="pixel-action-btn btn-primary"
              disabled={loading}
              onMouseEnter={handleHover}
            >
              {loading ? 'PROCESSING...' : isRegister ? '[ CREATE USER ]' : '[ ACCESS GRANTED ]'}
            </button>
            
            <button 
              type="button" 
              className="pixel-action-btn btn-secondary"
              onClick={toggleMode}
              onMouseEnter={handleHover}
            >
              {isRegister ? '<< BACK TO LOGIN' : 'CREATE ACCOUNT >>'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}