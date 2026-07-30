import { useMemo } from 'react';

// ตัวอักษรจีนธีมเกม ใช้ลอยเป็นพื้นหลังจางๆ สไตล์ Matrix
const CHAR_POOL = ['看', '图', '猜', '词', '汉', '语', '字', '龙', '虎', '花', '火', '水', '山', '风', '爱', '梦', '光', '影'];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export default function MatrixRain({ count = 22 }) {
  // ใช้ useMemo สร้างค่าสุ่มแค่ครั้งเดียวตอน mount ไม่ให้สุ่มใหม่ทุก re-render
  const glyphs = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      char: CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)],
      left: randomBetween(0, 100),
      duration: randomBetween(9, 20),
      delay: randomBetween(-18, 0),
      size: randomBetween(0.9, 1.9),
      opacity: randomBetween(0.08, 0.22),
    }));
  }, [count]);

  return (
    <div className="matrix-rain" aria-hidden="true">
      {glyphs.map((g) => (
        <span
          key={g.id}
          className="matrix-glyph"
          style={{
            left: `${g.left}%`,
            animationDuration: `${g.duration}s`,
            animationDelay: `${g.delay}s`,
            fontSize: `${g.size}rem`,
            opacity: g.opacity,
          }}
        >
          {g.char}
        </span>
      ))}
    </div>
  );
}