import React, { useState, useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import { playSound } from '../../SoundManager';
import './LoginScreen.css';

export default function LoginScreen({ onLoginSuccess }) {
  const { login } = useContext(AuthContext);
  const [isRegister, setIsRegister] = useState(false);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        // ถ้าสมัครเสร็จ สลับกลับไปหน้าล็อกอินพร้อมโชว์ข้อความสำเร็จ
        setIsRegister(false);
        setPassword('');
        setError('REGISTER SUCCESS! PLEASE LOGIN.');
        playSound('levelup');
      } else {
        // ถ้าล็อกอินสำเร็จ เก็บ Token ลง Context แล้วบอก App.jsx ให้เปลี่ยนหน้า
        login(data.token, data.user);
        playSound('start');
        setTimeout(() => {
          onLoginSuccess();
        }, 500);
      }
    } catch (err) {
      setError(err.message);
      playSound('wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleHover = () => playSound('tick');

  const toggleMode = () => {
    playSound('tick');
    setIsRegister(!isRegister);
    setError('');
  };

  return (
    <div className="pixel-login-wrapper">
      <div className="crt-scanlines"></div>
      
      <div className="pixel-login-card">
        <h1 className="pixel-login-title blink-fast">
          {isRegister ? 'SYSTEM_REGISTER' : 'SYSTEM_LOGIN'}
        </h1>
        
        <form onSubmit={handleSubmit} className="pixel-login-form">
          <div className="input-group">
            <label>USERNAME:</label>
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
            <label>PASSWORD:</label>
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
              [{error}]
            </div>
          )}

          <div className="login-actions">
            <button 
              type="submit" 
              className="pixel-action-btn btn-primary"
              disabled={loading}
              onMouseEnter={handleHover}
            >
              {loading ? 'PROCESSING...' : isRegister ? '[ REGISTER_ ]' : '[ ACCESS_ ]'}
            </button>
            
            <button 
              type="button" 
              className="pixel-action-btn btn-secondary"
              onClick={toggleMode}
              onMouseEnter={handleHover}
            >
              {isRegister ? '< BACK TO LOGIN' : 'CREATE ACCOUNT >'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}