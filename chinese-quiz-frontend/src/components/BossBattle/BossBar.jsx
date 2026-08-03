import React from 'react';
import './BossBattle.css';

export default function BossBar({ bossHp, maxBossHp, playerHp, maxPlayerHp }) {
  const hpPercent = Math.max(0, (bossHp / maxBossHp) * 100);

  return (
    <div className="boss-ui-container">
      <div className="boss-name">ANCIENT DRAGON 🐉</div>
      
      {/* หลอดเลือดบอส */}
      <div className="boss-hp-bar">
        <div className="boss-hp-fill" style={{ width: `${hpPercent}%` }}></div>
      </div>
      <div style={{ color: '#fff', fontSize: '10px' }}>HP: {bossHp} / {maxBossHp}</div>

      {/* หลอดเลือดผู้เล่น */}
      <div className="player-hp-wrapper">
        {Array.from({ length: maxPlayerHp }).map((_, i) => (
          <span key={i} style={{ opacity: i < playerHp ? 1 : 0.3 }}>
            {i < playerHp ? '❤️' : '🖤'}
          </span>
        ))}
      </div>
    </div>
  );
}