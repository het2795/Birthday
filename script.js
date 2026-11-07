// ============================================================
//  CONFIG — easy to edit
// ============================================================
const CONFIG = {
  name: "Chakshu",
  // Target: 8 November 2026 at midnight IST (00:00:00)
  birthday: "2026-11-08T00:00:00+05:30",
  fromName: "Someone who cares 💖",
  message: [
    "I couldn't wait until tomorrow, so I'm wishing you early.",
    "Happy Birthday in advance, Chakshu! You make every day brighter,",
    "and tomorrow I'm going to make sure you feel as special as you are. 🎂✨"
  ],
  // Set TEST_MODE to true to preview the birthday screen immediately without waiting!
  TEST_MODE: false
};

// ============================================================
//  GLOBALS
// ============================================================
let confettiParticles = [];
let fireworkParticles = [];
let countdownInterval = null;
let typewriterDone = false;
let prevValues = { d: -1, h: -1, m: -1, s: -1 };

// Canvas references
let confettiCanvas, confettiCtx;

// Balloon color palettes
const BALLOON_COLORS = [
  ['#ff6b9d', '#c44569'], // Rose pink
  ['#a29bfe', '#6c5ce7'], // Lavender purple
  ['#fd79a8', '#e84393'], // Hot pink
  ['#fdcb6e', '#e17055'], // Peach orange
  ['#55efc4', '#00b894'], // Mint
  ['#74b9ff', '#0984e3'], // Sky blue
  ['#ffeaa7', '#fdcb6e'], // Soft gold
  ['#ff7675', '#d63031'], // Coral red
  ['#e056fd', '#be2edd'], // Magenta
  ['#f8a5c2', '#f78fb3']  // Pastel rose
];

const CONFETTI_COLORS = [
  '#ff6b9d', '#a29bfe', '#ffd700', '#55efc4',
  '#74b9ff', '#ff7675', '#ffeaa7', '#fd79a8',
  '#e056fd', '#ffffff'
];

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', init);

function init() {
  // Set name in heading
  const heroNameEl = document.getElementById('hero-name');
  if (heroNameEl) heroNameEl.textContent = CONFIG.name;

  const fromLineEl = document.querySelector('.from-line');
  if (fromLineEl) fromLineEl.textContent = `— with love, ${CONFIG.fromName}`;

  // Canvas setup
  confettiCanvas = document.getElementById('confetti-canvas');
  if (confettiCanvas) {
    confettiCtx = confettiCanvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    requestAnimationFrame(confettiLoop);
  }

  // CONTINUOUS BALLOONS: never stop coming!
  startContinuousBalloons();

  // Music setup
  setupMusic();

  // Check if test mode or already birthday
  if (CONFIG.TEST_MODE || isBirthdayReached()) {
    showBirthdayScreen();
  } else {
    startCountdown();
  }
}

function resizeCanvas() {
  if (!confettiCanvas) return;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

function isBirthdayReached() {
  const target = new Date(CONFIG.birthday).getTime();
  return Date.now() >= target;
}

// ============================================================
//  CONTINUOUS BALLOONS (Never stop coming!)
// ============================================================
function startContinuousBalloons() {
  // Initial wave: launch 8 balloons with staggered delays
  for (let i = 0; i < 8; i++) {
    setTimeout(spawnSingleBalloon, i * 350);
  }

  // Continuous stream: continuously spawn a new balloon every 500-800ms
  function scheduleNextBalloon() {
    spawnSingleBalloon();
    const nextDelay = 450 + Math.random() * 450; // 450ms - 900ms
    setTimeout(scheduleNextBalloon, nextDelay);
  }

  setTimeout(scheduleNextBalloon, 1200);
}

function spawnSingleBalloon() {
  const container = document.getElementById('balloon-container');
  if (!container) return;

  const balloon = document.createElement('div');
  balloon.className = 'balloon';

  const palette  = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
  const size     = 45 + Math.random() * 55;        // 45px - 100px
  const leftPos  = 4 + Math.random() * 92;         // 4vw - 96vw
  const duration = 5.5 + Math.random() * 4.5;      // 5.5s - 10s
  const sway     = 18 + Math.random() * 35;        // 18px - 53px
  const opacity  = 0.85 + Math.random() * 0.15;

  balloon.style.left = `${leftPos}vw`;
  balloon.style.width = `${size}px`;
  balloon.style.height = `${size * 1.25}px`;
  balloon.style.background = `radial-gradient(circle at 35% 35%, ${palette[0]}, ${palette[1]})`;
  balloon.style.opacity = opacity;
  balloon.style.setProperty('--sw', `${sway}px`);
  balloon.style.animation = `balloon-up ${duration}s ease-in forwards`;

  // String under balloon
  const string = document.createElement('div');
  string.className = 'balloon-string';
  balloon.appendChild(string);

  container.appendChild(balloon);

  // Remove balloon from DOM once it has floated off the top
  setTimeout(() => {
    if (balloon.parentNode) {
      balloon.remove();
    }
  }, (duration + 1) * 1000);
}

// ============================================================
//  COUNTDOWN
// ============================================================
function startCountdown() {
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  const target = new Date(CONFIG.birthday).getTime();
  const now    = Date.now();
  const diff   = target - now;

  if (diff <= 0) {
    clearInterval(countdownInterval);
    showBirthdayScreen();
    return;
  }

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  updateDigit('d-num', days, prevValues.d);
  updateDigit('h-num', hours, prevValues.h);
  updateDigit('m-num', minutes, prevValues.m);
  updateDigit('s-num', seconds, prevValues.s);

  prevValues = { d: days, h: hours, m: minutes, s: seconds };

  // Dynamic romantic subtitle
  updateSubtitle(days, hours, minutes, seconds);
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function updateDigit(id, value, prevVal) {
  const el = document.getElementById(id);
  if (!el) return;

  const formatted = pad(value);
  if (formatted !== el.textContent) {
    el.textContent = formatted;
    // Trigger smooth bounce tick animation
    el.classList.remove('tick');
    void el.offsetWidth; // force reflow
    el.classList.add('tick');
  }
}

function updateSubtitle(days, hours, minutes, seconds) {
  const sub = document.getElementById('subtitle');
  if (!sub) return;

  if (days > 1) {
    sub.textContent = `Just ${days} days until your magical day 🌸`;
  } else if (days === 1) {
    sub.textContent = 'Tomorrow is your special day! Almost there... 💫';
  } else if (hours > 1) {
    sub.textContent = `Just ${hours} hours to go... can you feel the magic? 💖`;
  } else if (hours === 1) {
    sub.textContent = 'Only 1 hour left until midnight! 🌹';
  } else if (minutes > 10) {
    sub.textContent = `Final ${minutes} minutes! The countdown is almost over... ✨`;
  } else if (minutes > 1) {
    sub.textContent = `Just ${minutes} minutes left! So excited! 💕`;
  } else if (minutes === 1) {
    sub.textContent = 'Less than a minute! Get ready! 🎂';
  } else {
    sub.textContent = `🎉 Final ${seconds} seconds!! 🎉`;
  }
}

// ============================================================
//  BIRTHDAY SCREEN (Revealed at 00:00:00)
// ============================================================
function showBirthdayScreen() {
  const countdownView = document.getElementById('countdown-view');
  const bdayView      = document.getElementById('bday-view');

  if (countdownView) countdownView.classList.add('hidden');
  if (bdayView)      bdayView.classList.remove('hidden');

  // Staggered letters for "Happy Birthday Chakshu! 🎂"
  animateHeading(`Happy Birthday ${CONFIG.name}! 🎂`);

  // Extra celebration balloon burst
  for (let i = 0; i < 20; i++) {
    setTimeout(spawnSingleBalloon, i * 120);
  }

  // Firework burst celebration
  fireCelebrationShow();

  // Start typewriter message after heading settles
  setTimeout(startTypewriter, 1400);
}

function animateHeading(text) {
  const headingEl = document.getElementById('bday-heading');
  if (!headingEl) return;

  headingEl.innerHTML = '';
  [...text].forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.className = 'bday-letter';
    span.style.animationDelay = `${i * 0.06}s`;
    headingEl.appendChild(span);
  });
}

function fireCelebrationShow() {
  // Initial big confetti bursts
  burstConfetti(250, window.innerWidth / 2, window.innerHeight * 0.4);
  burstConfetti(150, window.innerWidth * 0.2, window.innerHeight * 0.5);
  burstConfetti(150, window.innerWidth * 0.8, window.innerHeight * 0.5);

  // Fireworks interval
  let count = 0;
  const fwInterval = setInterval(() => {
    const x = window.innerWidth * (0.15 + Math.random() * 0.7);
    const y = window.innerHeight * (0.15 + Math.random() * 0.45);
    launchFirework(x, y);
    count++;
    if (count > 25) clearInterval(fwInterval);
  }, 400);
}

// ============================================================
//  TYPEWRITER
// ============================================================
function startTypewriter() {
  if (typewriterDone) return;
  typewriterDone = true;

  const el = document.getElementById('typewriter');
  if (!el) return;

  const fullText = CONFIG.message.join('\n\n');
  let idx = 0;

  function typeNext() {
    if (idx < fullText.length) {
      if (fullText[idx] === '\n') {
        el.innerHTML += '<br/>';
      } else {
        const char = fullText[idx];
        if (char === '<') el.innerHTML += '&lt;';
        else if (char === '>') el.innerHTML += '&gt;';
        else if (char === '&') el.innerHTML += '&amp;';
        else el.innerHTML += char;
      }
      idx++;
      setTimeout(typeNext, 35 + Math.random() * 25);
    } else {
      // Keep blinking cursor or stop
      setTimeout(() => {
        el.style.borderRight = 'none';
      }, 3000);
    }
  }

  typeNext();
}

// ============================================================
//  CONFETTI & FIREWORKS (Canvas 60fps)
// ============================================================
function burstConfetti(count, x, y) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 12;
    confettiParticles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 5 + Math.random() * 7,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
      gravity: 0.25 + Math.random() * 0.2,
      life: 1
    });
  }
}

function launchFirework(x, y) {
  const hue = Math.random() * 360;
  for (let i = 0; i < 70; i++) {
    const angle = (i / 70) * Math.PI * 2;
    const speed = 2 + Math.random() * 7;
    fireworkParticles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: `hsl(${hue + (Math.random() * 50 - 25)}, 100%, 70%)`,
      size: 2 + Math.random() * 3,
      gravity: 0.08,
      life: 1,
      decay: 0.015 + Math.random() * 0.01
    });
  }
}

function confettiLoop() {
  if (!confettiCtx || !confettiCanvas) return;

  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  // Confetti update
  confettiParticles = confettiParticles.filter(p => p.life > 0);
  for (const p of confettiParticles) {
    p.x  += p.vx;
    p.y  += p.vy;
    p.vy += p.gravity;
    p.vx *= 0.99;
    p.rotation += p.rotationSpeed;
    p.life -= 0.009;

    confettiCtx.save();
    confettiCtx.globalAlpha = Math.max(0, p.life);
    confettiCtx.fillStyle   = p.color;
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate((p.rotation * Math.PI) / 180);

    if (p.shape === 'rect') {
      confettiCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    } else {
      confettiCtx.beginPath();
      confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      confettiCtx.fill();
    }
    confettiCtx.restore();
  }

  // Fireworks update
  fireworkParticles = fireworkParticles.filter(p => p.life > 0);
  for (const p of fireworkParticles) {
    p.x  += p.vx;
    p.y  += p.vy;
    p.vy += p.gravity;
    p.vx *= 0.98;
    p.life -= p.decay;

    confettiCtx.save();
    confettiCtx.globalAlpha = Math.max(0, p.life);
    confettiCtx.fillStyle   = p.color;
    confettiCtx.shadowColor = p.color;
    confettiCtx.shadowBlur  = 6;
    confettiCtx.beginPath();
    confettiCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    confettiCtx.fill();
    confettiCtx.restore();
  }

  requestAnimationFrame(confettiLoop);
}

// ============================================================
//  MUSIC
// ============================================================
function setupMusic() {
  const btn = document.getElementById('music-btn');
  const audio = document.getElementById('bg-music');
  if (!btn || !audio) return;

  audio.volume = 0.45;

  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => updateMusicIcon(true)).catch(() => {});
    } else {
      audio.pause();
      updateMusicIcon(false);
    }
  });

  // Try auto-play on first user interaction anywhere
  const playOnce = () => {
    if (audio.paused) {
      audio.play().then(() => updateMusicIcon(true)).catch(() => {});
    }
    window.removeEventListener('pointerdown', playOnce);
  };
  window.addEventListener('pointerdown', playOnce, { once: true });
}

function updateMusicIcon(isPlaying) {
  const icon = document.getElementById('music-icon');
  if (icon) {
    icon.textContent = isPlaying ? '🎵' : '🔇';
  }
}
