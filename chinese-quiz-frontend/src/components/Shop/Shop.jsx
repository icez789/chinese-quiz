import React, { useState, useEffect } from 'react';
import { playSound, playBGM } from '../../SoundManager';
import '../Category/CategoryMenu.css';

const SHOP_ITEMS = [
  { id: 'item_5050', name: '50/50', icon: '💡', desc: 'ตัดช้อยส์ผิดออก 2 ข้อ', price: 100 },
  { id: 'item_freeze', name: 'TIME FREEZE', icon: '⏱️', desc: 'หยุดเวลา 5 วินาที', price: 150 },
  { id: 'item_1up', name: '1-UP', icon: '❤️', desc: 'เพิ่มหัวใจ 1 ดวงตอนเริ่ม', price: 200 }
];

const cardStyle = {
  display: 'flex',
  flexDirection: 'column',
  padding: '15px'
};

const headerStyle = {
  color: '#ffd700',
  marginTop: '10px',
  fontSize: '18px',
  textShadow: '2px 2px 0px #000'
};

export default function Shop({ onBack, token }) {
  const [coins, setCoins] = useState(0);
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    playBGM('category');

    if (!token) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchInventory = async () => {
      try {
        const res = await fetch('/api/shop/inventory', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!isMounted) return;

        if (res.ok) {
          const data = await res.json();
          setCoins(data.coins ?? 0);
          setInventory(data.inventory ?? {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInventory();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleHover = () => playSound('tick');

  const handleBack = () => {
    playSound('click');
    if (onBack) {
      onBack();
    }
  };

  const handleBuy = async (item) => {
    if (coins < item.price) {
      playSound('wrong');
      alert('⚠️ COINS ไม่พอ! ไปฟาร์มมาก่อนนะ');
      return;
    }

    playSound('click');

    try {
      const res = await fetch('/api/shop/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ item_id: item.id, price: item.price })
      });

      if (res.ok) {
        const data = await res.json();
        playSound('levelup');
        setCoins(data.remaining_coins ?? coins);
        setInventory((prev) => ({
          ...prev,
          [item.id]: (prev[item.id] || 0) + 1
        }));
      } else {
        playSound('wrong');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="pixel-loading-container">
        <div className="pixel-text">LOADING_SHOP<span className="blink">_</span></div>
      </div>
    );
  }

  return (
    <div className="pixel-container">
      {/* 🌟 พระเอกของเราอยู่ตรงนี้! CSS สำหรับแก้ปัญหาสีกลืนกับพื้นหลังตอน Hover */}
      <style>{`
        .shop-card .shop-item-name {
          color: #00f2fe;
        }
        .shop-card .shop-item-desc {
          font-size: 10px;
          color: #aaa;
          margin: 10px 0;
          min-height: 30px;
        }
        .shop-card .shop-item-owned {
          font-size: 12px;
          color: #00f2fe;
          margin-bottom: 15px;
        }
        
        /* สั่งเปลี่ยนสีตัวอักษรเป็นสีเข้มเมื่อเมาส์ชี้การ์ด */
        .pixel-card.shop-card:hover .shop-item-name,
        .pixel-card.shop-card:hover .shop-item-owned {
          color: #000;
          text-shadow: none;
        }
        .pixel-card.shop-card:hover .shop-item-desc {
          color: #222;
        }
      `}</style>

      <div className="pixel-starfield stars-slow"></div>
      <div className="pixel-starfield stars-medium"></div>
      <div className="pixel-starfield stars-fast"></div>
      <div className="crt-scanlines"></div>

      <div className="pixel-main-content">
        <div className="pixel-header">
          <div className="pixel-kicker">BLACK_MARKET</div>
          <h1 className="pixel-title">ร้านค้าไอเทม<span className="blink">_</span></h1>
          <div style={headerStyle}>COINS: {coins} 🪙</div>
        </div>

        <div className="pixel-grid" style={{ marginTop: '20px' }}>
          {SHOP_ITEMS.map((item) => (
            <div key={item.id} className="pixel-card shop-card" style={cardStyle}>
              <div style={{ fontSize: '30px', marginBottom: '10px' }}>{item.icon}</div>
              
              {/* 🌟 เปลี่ยนมาใช้ Class เพื่อให้ CSS ด้านบนทำงานได้ */}
              <div className="pixel-name shop-item-name">{item.name}</div>
              <div className="shop-item-desc">
                {item.desc}
              </div>
              <div className="shop-item-owned">
                OWNED: {inventory[item.id] || 0}
              </div>

              <button
                onClick={() => handleBuy(item)}
                onMouseEnter={handleHover}
                disabled={coins < item.price}
                style={{
                  backgroundColor: coins >= item.price ? '#e91e63' : '#555',
                  color: '#fff',
                  border: '3px solid #000',
                  padding: '10px',
                  fontFamily: "'Press Start 2P', monospace",
                  cursor: coins >= item.price ? 'pointer' : 'not-allowed',
                  boxShadow: '4px 4px 0px rgba(0,0,0,0.5)',
                  opacity: coins >= item.price ? 1 : 0.8
                }}
              >
                BUY {item.price} 🪙
              </button>
            </div>
          ))}
        </div>

        <button
          className="pixel-back-btn"
          onClick={handleBack}
          onMouseEnter={handleHover}
          style={{ marginTop: '40px' }}
        >
          [ RETURN_TO_HQ ]
        </button>
      </div>
    </div>
  );
}