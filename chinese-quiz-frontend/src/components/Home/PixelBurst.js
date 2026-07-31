export const triggerPixelBurst = (e) => {
  // สีธีมของเรา
  const colors = ['#39ff14', '#00f2fe', '#ff007f', '#fce83a', '#ff2a2a', '#ffffff'];
  const numParticles = 15; // จำนวนเศษพิกเซล

  // หาจุดที่เมาส์คลิก (ถ้าไม่มีให้ระเบิดตรงกลางจอ)
  const x = e.clientX || window.innerWidth / 2;
  const y = e.clientY || window.innerHeight / 2;

  for (let i = 0; i < numParticles; i++) {
    const particle = document.createElement('div');
    
    // 🌟 กำหนด Style สดๆ ใน JS เลย (ชัวร์ 100% ว่าติดแน่นอน)
    Object.assign(particle.style, {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      width: '8px',
      height: '8px',
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      pointerEvents: 'none',
      zIndex: '9999',
      boxShadow: '2px 2px 0px rgba(0,0,0,0.5)',
      transform: 'translate(-50%, -50%)' // ให้อยู่ตรงกลางจุดที่คลิกเป๊ะๆ
    });

    // แปะลงเว็บ
    document.body.appendChild(particle);

    // คำนวณทิศทางกระเด็น (วงกลม 360 องศา)
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 80 + 40; // ระยะทางกระเด็น
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    // 🌟 ใช้ Web Animations API สั่งให้มันขยับและจางหายไป
    const animation = particle.animate([
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
    ], {
      duration: 500, // ความเร็ว 0.5 วินาที
      easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
    });

    // ลบแท็กทิ้งอัตโนมัติเมื่อแอนิเมชันเล่นจบ
    animation.onfinish = () => particle.remove();
  }
};