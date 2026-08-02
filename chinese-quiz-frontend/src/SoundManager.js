// SoundManager.js - SFX 8-bit & BGM Playlist System + Volume Control 🎧

let audioCtx = null;

// 🌟 ตัวแปรควบคุมเสียงระดับ Global
let globalVolume = 1.0; // 0.0 ถึง 1.0
let isMuted = false;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

// 🌟 ฟังก์ชันจัดการเสียงส่วนกลางที่ Component อื่นเรียกใช้ได้
export function setGlobalVolume(vol) {
  globalVolume = Math.max(0, Math.min(1, vol));
  updateBgmVolume();
}

export function toggleMute(mutedStatus) {
  isMuted = mutedStatus;
  updateBgmVolume();
}

// ฟังก์ชันอัปเดตความดังของ BGM ทันทีเมื่อมีการกดปุ่ม
function updateBgmVolume() {
  if (currentBgmAudio) {
    // กำหนดให้ BGM เบากว่า SFX เล็กน้อย (คูณ 0.3)
    currentBgmAudio.volume = isMuted ? 0 : globalVolume * 0.3; 
  }
}

function playTone(freq, duration, type = 'sine', baseVolume = 0.2, delay = 0) {
  if (isMuted || globalVolume === 0) return; // 🌟 ถ้า Mute อยู่ ไม่ต้องเล่นเสียง

  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  const startTime = ctx.currentTime + delay;
  // 🌟 เอาความดังพื้นฐานมาคูณกับ Volume ของระบบ
  const finalVolume = baseVolume * globalVolume; 
  
  gain.gain.setValueAtTime(finalVolume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

// =========================================
// 🔫 ระบบเล่นเสียงเอฟเฟกต์ (SFX)
// =========================================
export function playSound(name) {
  switch (name) {
    case 'correct':
      playTone(523.25, 0.12, 'sine', 0.25, 0);      
      playTone(783.99, 0.18, 'sine', 0.25, 0.1);    
      break;
    case 'wrong':
      playTone(196, 0.25, 'sawtooth', 0.15, 0);
      break;
    case 'click':
      playTone(600, 0.06, 'square', 0.1, 0);
      break;
    case 'start':
      playTone(987.77, 0.1, 'square', 0.2, 0);      
      playTone(1318.51, 0.3, 'square', 0.2, 0.1);   
      break;
    case 'finish':
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
      playTone(880, 0.05, 'square', 0.1, 0); 
      break;
    case 'wakeup':
      playTone(440, 0.1, 'sine', 0.1, 0);
      break;
    default:
      break;
  }
}

// =========================================
// 🎵 ระบบเพลย์ลิสต์ (BGM PLAYLIST)
// =========================================

// 🌟 อัปเดตรายชื่อไฟล์ตามในภาพ image_1acb7e.png ของคุณเป๊ะๆ
const BGM_PLAYLISTS = {
  home: [
    '/sounds/home-1.mp3', 
    '/sounds/home-2.mp3'
  ],
  category: [
    '/sounds/category-1.mp3'
  ],
  quiz_normal: [
    '/sounds/normal-1.mp3', 
    '/sounds/normal-2.mp3', 
    '/sounds/normal-3.mp3'
  ],
  quiz_random: [
    '/sounds/random-1.mp3',
    '/sounds/random-2.mp3',
    '/sounds/random-3.mp3'
  ],
  quiz_hell: [
    '/sounds/hell-1.mp3', 
    '/sounds/hell-2.mp3'
  ],
  result: [
    '/sounds/result-1.mp3',
    '/sounds/result-2.mp3'
  ],
  profile: [
    '/sounds/profile-1.mp3',
    '/sounds/profile-2.mp3'
  ],
  leaderboard: [
    '/sounds/leaderboard-1.mp3'
  ]
};

let currentBgmAudio = null;
let currentPlaylistName = null;
let currentTrackIndex = 0;

export function playBGM(playlistName) {
  if (currentPlaylistName === playlistName && currentBgmAudio && !currentBgmAudio.paused) {
    return;
  }

  stopBGM(); 

  const playlist = BGM_PLAYLISTS[playlistName];
  if (!playlist || playlist.length === 0) {
    console.warn(`ไม่พบเพลย์ลิสต์สำหรับ: ${playlistName}`);
    return;
  }

  currentPlaylistName = playlistName;
  currentTrackIndex = 0; 
  
  playCurrentTrack();
}

function playCurrentTrack() {
  const playlist = BGM_PLAYLISTS[currentPlaylistName];
  if (!playlist) return;

  const trackUrl = playlist[currentTrackIndex];
  currentBgmAudio = new Audio(trackUrl);
  
  // 🌟 ตอนเริ่มเล่น กำหนดความดังตาม State ปัจจุบัน
  currentBgmAudio.volume = isMuted ? 0 : globalVolume * 0.3; 

  currentBgmAudio.addEventListener('ended', () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    playCurrentTrack(); 
  });

  currentBgmAudio.play().catch(err => {
    console.warn(`เล่น BGM ไม่ได้:`, err);
  });
}

export function stopBGM() {
  if (currentBgmAudio) {
    currentBgmAudio.pause();
    currentBgmAudio.currentTime = 0;
    currentBgmAudio = null;
  }
  currentPlaylistName = null;
}