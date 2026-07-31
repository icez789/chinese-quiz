// SoundManager.js - สร้างเสียงด้วย Web Audio API (ไม่ต้องใช้ไฟล์เสียง)

let audioCtx = null;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(freq, duration, type = 'sine', volume = 0.2, delay = 0) {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  const startTime = ctx.currentTime + delay;
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function playSound(name) {
  switch (name) {
    case 'correct':
      // เสียงสูงขึ้น 2 โน้ต ให้ความรู้สึกบวก
      playTone(523.25, 0.12, 'sine', 0.25, 0);      // C5
      playTone(783.99, 0.18, 'sine', 0.25, 0.1);    // G5
      break;

    case 'wrong':
      // เสียงต่ำ สั้น กระด้าง
      playTone(196, 0.25, 'sawtooth', 0.15, 0);
      break;

    case 'click':
      playTone(600, 0.06, 'square', 0.1, 0);
      break;
      
    case 'start':
      // เสียง Insert Coin / เริ่มเกมสไตล์ 8-bit (ติ๊ง-ตริ๊งงง!)
      playTone(987.77, 0.1, 'square', 0.2, 0);      // B5
      playTone(1318.51, 0.3, 'square', 0.2, 0.1);   // E6
      break;

    case 'finish':
      // เสียงชุดฉลองจบเกม (arpeggio ขึ้น)
      playTone(523.25, 0.15, 'sine', 0.22, 0);
      playTone(659.25, 0.15, 'sine', 0.22, 0.12);
      playTone(783.99, 0.15, 'sine', 0.22, 0.24);
      playTone(1046.5, 0.3, 'sine', 0.25, 0.36);
      break;

    case 'levelup':
      playTone(440, 0.1, 'triangle', 0.2, 0);
      playTone(554.37, 0.1, 'triangle', 0.2, 0.1);
      playTone(659.25, 0.1, 'triangle', 0.2, 0.2);
      playTone(880, 0.35, 'triangle', 0.25, 0.3);
      break;

    case 'tick':
      // เสียงติ๊กสั้นๆ แหลมๆ คล้ายนาฬิกาจับเวลาหรือเสียงบี๊บ
      playTone(880, 0.05, 'square', 0.1, 0); 
      break;
      
    default:
      break;
  }
}