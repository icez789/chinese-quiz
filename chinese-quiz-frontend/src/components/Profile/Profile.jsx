import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import { playSound } from '../../SoundManager';
import './Profile.css';

export default function Profile({ onBack }) {
  const { user, token } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
    playSound('wakeup'); 
  }, [token]);

  const handleBackClick = () => {
    playSound('click');
    setTimeout(() => onBack(), 400);
  };

  const handleHover = () => playSound('tick');

  const getAchievements = () => {
    if (!profileData) return [];
    const { stats, accuracy, totalGames } = profileData;
    const badges = [];

    if (stats.current_level >= 5) badges.push({ icon: '🎖️', name: 'VETERAN', desc: 'Reach Level 5' });
    if (stats.current_level >= 10) badges.push({ icon: '👑', name: 'MASTER', desc: 'Reach Level 10' });
    if (accuracy >= 80) badges.push({ icon: '🎯', name: 'SHARPSHOOTER', desc: 'Accuracy 80%+' });
    if (totalGames >= 10) badges.push({ icon: '🔥', name: 'ADDICT', desc: 'Play 10 Games' });
    if (badges.length === 0) badges.push({ icon: '🌱', name: 'ROOKIE', desc: 'New Challenger' });

    return badges;
  };

  if (loading || !profileData) {
    return <div className="pixel-loading">LOADING_PROFILE...</div>;
  }

  const achievements = getAchievements();

  return (
    <div className="pixel-profile-wrapper">
      <div className="crt-scanlines"></div>
      
      <div className="pixel-profile-card">
        {/* หัวกระดาษ ID Card */}
        <div className="profile-header">
          <h1 className="profile-title">[ PLAYER_DOSSIER ]</h1>
        </div>

        <div className="profile-grid">
          {/* ข้อมูลซ้าย: สถิติหลัก */}
          <div className="profile-section stats-section">
            <h2 className="section-label">ID: <span className="text-green">{user.username}</span></h2>
            <div className="stat-row">
              <span>LEVEL:</span>
              <span className="stat-value text-blue">Lv.{profileData.stats.current_level}</span>
            </div>
            <div className="stat-row">
              <span>TOTAL SCORE:</span>
              <span className="stat-value text-pink">{profileData.stats.total_score}</span>
            </div>
            <div className="stat-row">
              <span>ACCURACY:</span>
              <div className="accuracy-container">
                <div className="pixel-progress-bar">
                  <div 
                    className="pixel-progress-fill" 
                    style={{ width: `${profileData.accuracy}%` }}
                  ></div>
                </div>
                <span className="stat-value text-yellow">{profileData.accuracy}%</span>
              </div>
            </div>
          </div> 

          {/* ข้อมูลขวา: Achievements */}
          <div className="profile-section achievement-section">
            <h2 className="section-label">ACHIEVEMENTS</h2>
            <div className="badges-container">
              {achievements.map((badge, idx) => (
                <div key={idx} className="badge-item" title={badge.desc}>
                  <span className="badge-icon">{badge.icon}</span>
                  <span className="badge-name">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ประวัติการเล่น */}
        <div className="profile-section history-section">
          <h2 className="section-label">RECENT MISSIONS</h2>
          {profileData.history.length > 0 ? (
            <ul className="history-list">
              {profileData.history.map((record, idx) => {
                
                // 🌟 จุดที่แก้ไข: ถ้าชื่อหมวดหมู่เป็น null ให้แสดงข้อความนี้แทน
                const catName = record.category_name || 'สุ่มมั่ว / HELL MODE';

                return (
                  <li key={idx}>
                    {/* 🌟 ปรับสีนิดหน่อยให้ดูสวยขึ้น */}
                    <span className="history-cat text-pink">[{catName}]</span>
                    <span className="history-score">SCORE: {record.score}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="no-history">NO RECORDS FOUND.</p>
          )}
        </div>

        <button 
          className="pixel-action-btn btn-secondary back-btn"
          onClick={handleBackClick}
          onMouseEnter={handleHover}
        >
          &lt;&lt; BACK TO HQ
        </button>
      </div>
    </div>
  );
}