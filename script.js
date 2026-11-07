/**
 * ====================================================================
 * SCRAPBOOK LOVE LETTER BIRTHDAY - JAVASCRIPT
 * Romantic interactive website handcrafted for CHAKSHU ❤️
 * ====================================================================
 */

// ====================================================================
// 1. CONFIGURATION (EDIT EVERYTHING HERE)
// ====================================================================
const CONFIG = {
  // Personalization
  girlfriendName: "Chakshu",
  myName: "Het",
  birthdayDate: "8 November",

  // Music configuration
  song: {
    title: "Perfect",
    artist: "Ed Sheeran",
    src: "assets/music.mp3"
  },

  // Photos & orientation configs (rotate: 0, 90, 180, 270, scale: 1.0 - 2.0)
  // Black bars are cropped with CSS object-fit: cover and optional scale
  photos: [
    { url: "assets/photos/1.jpg", rotate: 0, scale: 1, caption: "Our beginning ❤️" },
    { url: "assets/photos/2.jpg", rotate: 0, scale: 1, caption: "That beautiful smile ✨" },
    { url: "assets/photos/3.jpg", rotate: 0, scale: 1, caption: "Every moment with you 🌸" },
    { url: "assets/photos/4.jpg", rotate: 0, scale: 1, caption: "My favourite view ☕" },
    { url: "assets/photos/5.jpg", rotate: 0, scale: 1.55, caption: "Happy Birthday Chakshu 🎂" },
    { url: "assets/photos/6.jpg", rotate: 0, scale: 1, caption: "Us together forever 💕" }
  ],

  // Optional video for Screen 3 (Birthday polaroid)
  video: {
    src: "assets/video.mp4",
    rotate: 0,
    enabled: false // set to true if assets/video.mp4 exists
  },

  // All messages (exact texts requested)
  messages: {
    letter: `My dearest Chakshu,

Happy Birthday, my love! Today is all about you, and I know that someone as special as you deserves a day that is just as special.

Ever since you came into my life, everything feels a little more beautiful. Your smile, your words, your little habits, they are all my favourite things.

I promise to always be by your side, in every happiness and every hardship. Just keep smiling like this.

Love you forever and always. ❤️`,

    missMe: "Whenever you miss me, just remember that even when I'm far away, I'm only one call away. You are my sweetest memory and my favourite habit. 💕",

    surprise: "Surprise! The biggest gift you got is me (just kidding 😜). The real gift is that I'll always be with you. Happy Birthday, Chakshu! 🎁❤️",

    piecesCaption: "A few little moments from our story",

    question: "Chakshu, will you be mine forever?",

    wrongButton: "Oops, you pressed the wrong button! You're cute, try again 😄",

    finalYes: "I knew you'd say yes! I love you, Chakshu. Happy Birthday, my love! 🎂❤️"
  },

  // TEST MODE:
  // 0 = normal flow (starts at Screen 1)
  // 1, 2, 3, 4, 5, 6 = jump directly to screen 1..6 for testing
  TEST_MODE: 0
};


// ====================================================================
// 2. GLOBAL STATE
// ====================================================================
let currentScreen = 1;
let isMusicPlaying = false;
let typewriterTimeout = null;
let typewriterFinished = false;
let openedPickItems = new Set();
let lightboxIndex = 0;
let audioContext = null;
let synthOscillators = [];
let synthInterval = null;


// ====================================================================
// 3. INITIALIZATION ON DOM READY
// ====================================================================
document.addEventListener("DOMContentLoaded", () => {
  setupCanvas();
  applyConfigToDOM();
  setupEventListeners();
  setupAudio();
  applyPhotoOrientations();

  // Handle TEST_MODE
  if (CONFIG.TEST_MODE >= 1 && CONFIG.TEST_MODE <= 6) {
    goToScreen(CONFIG.TEST_MODE);
  } else {
    goToScreen(1);
  }
});


// ====================================================================
// 4. APPLY CONFIG DATA TO DOM
// ====================================================================
function applyConfigToDOM() {
  // Personal names
  const nameHighlights = document.querySelectorAll(".name-highlight");
  nameHighlights.forEach(el => el.textContent = CONFIG.girlfriendName);

  const sigNameDisplay = document.getElementById("sig-name-display");
  if (sigNameDisplay) sigNameDisplay.textContent = CONFIG.myName;

  // Music titles
  const songTitleEl = document.getElementById("song-title-display");
  const songArtistEl = document.getElementById("song-artist-display");
  if (songTitleEl) songTitleEl.textContent = CONFIG.song.title;
  if (songArtistEl) songArtistEl.textContent = CONFIG.song.artist;

  // Texts
  const msgMissMe = document.getElementById("msg-miss-me-text");
  if (msgMissMe) msgMissMe.textContent = `"${CONFIG.messages.missMe}"`;

  const msgSurprise = document.getElementById("msg-surprise-text");
  if (msgSurprise) msgSurprise.textContent = `"${CONFIG.messages.surprise}"`;

  const piecesCaption = document.getElementById("pieces-caption-header");
  if (piecesCaption) piecesCaption.textContent = CONFIG.messages.piecesCaption;

  const questionText = document.getElementById("question-text");
  if (questionText) questionText.textContent = CONFIG.messages.question;

  const wrongBtnMsg = document.getElementById("wrong-button-msg");
  if (wrongBtnMsg) wrongBtnMsg.textContent = CONFIG.messages.wrongButton;

  const finalYesText = document.getElementById("final-yes-text");
  if (finalYesText) finalYesText.textContent = CONFIG.messages.finalYes;

  // Video check for screen 3
  if (CONFIG.video && CONFIG.video.enabled) {
    const v = document.getElementById("bday-polaroid-video");
    const img = document.getElementById("bday-polaroid-img");
    if (v && img) {
      v.src = CONFIG.video.src;
      v.classList.remove("hidden");
      img.classList.add("hidden");
      if (CONFIG.video.rotate) {
        v.style.transform = `rotate(${CONFIG.video.rotate}deg)`;
      }
    }
  }
}

// Apply rotation and scale configs per photo
function applyPhotoOrientations() {
  CONFIG.photos.forEach((photo, idx) => {
    const rot = photo.rotate || 0;
    const scale = photo.scale || 1;
    const items = document.querySelectorAll(`.photo-item-${idx}`);
    items.forEach(el => {
      el.style.transform = `rotate(${rot}deg) scale(${scale})`;
      el.style.objectFit = 'cover';
    });
  });
}

// Graceful fallback for missing photos
window.handlePhotoError = function(imgElement, caption) {
  const container = imgElement.parentElement;
  if (!container) return;

  const placeholderSvg = `
    <div class="photo-placeholder-box">
      <div class="ph-icon">📷🌸</div>
      <div class="ph-title">${caption || 'Our Precious Memory'}</div>
    </div>
  `;
  container.innerHTML = placeholderSvg;
};


// ====================================================================
// 5. SCREEN TRANSITIONS
// ====================================================================
function goToScreen(screenNum) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach(s => s.classList.remove("active"));

  const targetScreen = document.getElementById(`screen-${screenNum}`);
  if (targetScreen) {
    targetScreen.classList.add("active");
    currentScreen = screenNum;
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Screen specific triggers
    if (screenNum === 3) {
      triggerCalendarAnimation();
    } else if (screenNum === 4) {
      triggerTypewriterLetter();
    }
  }
}


// ====================================================================
// 6. EVENT LISTENERS
// ====================================================================
function setupEventListeners() {
  // Navigation Next buttons
  const nextBtns = document.querySelectorAll("[data-next-screen]");
  nextBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const nextNum = parseInt(btn.getAttribute("data-next-screen"), 10);
      goToScreen(nextNum);
    });
  });

  // SCREEN 1: Envelope Tap
  const envelopeStage = document.getElementById("envelope-stage");
  if (envelopeStage) {
    envelopeStage.addEventListener("click", handleEnvelopeOpen);
    envelopeStage.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") handleEnvelopeOpen();
    });
  }

  // Global Music Toggle Button
  const musicToggle = document.getElementById("global-music-toggle");
  if (musicToggle) {
    musicToggle.addEventListener("click", toggleMusic);
  }

  // Screen 2: Vinyl record tap
  const vinylBtn = document.getElementById("memories-vinyl");
  if (vinylBtn) {
    vinylBtn.addEventListener("click", toggleMusic);
  }

  // Screen 4: Tap letter to complete typewriter immediately
  const letterWrapper = document.getElementById("letter-unfold-wrapper");
  if (letterWrapper) {
    letterWrapper.addEventListener("click", () => {
      if (!typewriterFinished) {
        completeTypewriterInstantly();
      }
    });
  }

  // Screen 5: Pick items taps
  const pickA = document.getElementById("pick-item-a");
  const pickB = document.getElementById("pick-item-b");
  const pickC = document.getElementById("pick-item-c");

  if (pickA) pickA.addEventListener("click", () => openSubview("subview-miss-me", "a"));
  if (pickB) pickB.addEventListener("click", () => openSubview("subview-pieces", "b"));
  if (pickC) pickC.addEventListener("click", () => openSubview("subview-gift", "c"));

  // Screen 5: Subview Back buttons
  const backA = document.getElementById("back-from-miss-me");
  const backB = document.getElementById("back-from-pieces");
  const backC = document.getElementById("back-from-gift");

  if (backA) backA.addEventListener("click", () => closeSubview("subview-miss-me"));
  if (backB) backB.addEventListener("click", () => closeSubview("subview-pieces"));
  if (backC) backC.addEventListener("click", () => closeSubview("subview-gift"));

  // Screen 5: Interactive Gift Box
  const giftBoxStage = document.getElementById("interactive-gift-stage");
  if (giftBoxStage) {
    giftBoxStage.addEventListener("click", handleGiftBoxOpen);
  }

  // Screen 5: Button to Screen 6
  const btnToScreen6 = document.getElementById("btn-to-screen-6");
  if (btnToScreen6) {
    btnToScreen6.addEventListener("click", () => goToScreen(6));
  }

  // Screen 5: Polaroid Collage Tiles click -> Open Lightbox
  const polaroidTiles = document.querySelectorAll(".polaroid-tile");
  polaroidTiles.forEach(tile => {
    tile.addEventListener("click", () => {
      const pIdx = parseInt(tile.getAttribute("data-pindex"), 10) || 0;
      openLightbox(pIdx);
    });
  });

  // Lightbox Modal Controls
  const lbClose = document.getElementById("lightbox-close");
  const lbBackdrop = document.getElementById("lightbox-backdrop");
  const lbPrev = document.getElementById("lb-prev");
  const lbNext = document.getElementById("lb-next");

  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lbBackdrop) lbBackdrop.addEventListener("click", closeLightbox);
  if (lbPrev) lbPrev.addEventListener("click", () => navigateLightbox(-1));
  if (lbNext) lbNext.addEventListener("click", () => navigateLightbox(1));

  // SCREEN 6: Runaway NO Button & YES Button
  setupQuestionCard();

  // SCREEN 6: Replay Button
  const btnReplay = document.getElementById("btn-replay");
  if (btnReplay) {
    btnReplay.addEventListener("click", resetStory);
  }
}


// ====================================================================
// 7. SCREEN 1: ENVELOPE OPENING ANIMATION
// ====================================================================
function handleEnvelopeOpen() {
  const envWrapper = document.getElementById("envelope-wrapper");
  if (!envWrapper || envWrapper.classList.contains("opened")) return;

  envWrapper.classList.add("opened");

  // Play music on this user gesture (vital for mobile browsers!)
  startMusic();

  // Burst hearts and golden sparkles
  burstEnvelopeParticles();

  // Smooth transition into Screen 2
  setTimeout(() => {
    goToScreen(2);
  }, 1100);
}

function burstEnvelopeParticles() {
  const burstContainer = document.getElementById("envelope-burst");
  if (!burstContainer) return;

  const icons = ["❤️", "💖", "✨", "🌸", "💕", "⭐", "💌"];
  for (let i = 0; i < 24; i++) {
    const p = document.createElement("span");
    p.className = "burst-particle";
    p.textContent = icons[Math.floor(Math.random() * icons.length)];

    const angle = (Math.PI * 2 * i) / 24 + (Math.random() - 0.5);
    const dist = 70 + Math.random() * 110;
    const tx = `${Math.cos(angle) * dist}px`;
    const ty = `${Math.sin(angle) * dist - 30}px`;
    const rot = `${(Math.random() - 0.5) * 120}deg`;

    p.style.setProperty("--tx", tx);
    p.style.setProperty("--ty", ty);
    p.style.setProperty("--rot", rot);

    burstContainer.appendChild(p);

    setTimeout(() => {
      p.remove();
    }, 1300);
  }
}


// ====================================================================
// 8. SCREEN 3: CALENDAR ANIMATION
// ====================================================================
function triggerCalendarAnimation() {
  const circlePath = document.getElementById("marker-circle-path");
  if (circlePath) {
    circlePath.style.strokeDashoffset = "240";
    setTimeout(() => {
      circlePath.style.strokeDashoffset = "0";
    }, 300);
  }
}


// ====================================================================
// 9. SCREEN 4: TYPEWRITER LETTER EFFECT
// ====================================================================
function triggerTypewriterLetter() {
  const target = document.getElementById("typewriter-content");
  const cursor = document.getElementById("typewriter-cursor");
  if (!target) return;

  target.textContent = "";
  if (cursor) cursor.style.display = "inline-block";

  const fullText = CONFIG.messages.letter;
  let charIndex = 0;
  typewriterFinished = false;

  if (typewriterTimeout) clearTimeout(typewriterTimeout);

  function typeNextChar() {
    if (charIndex < fullText.length) {
      target.textContent += fullText.charAt(charIndex);
      charIndex++;
      const char = fullText.charAt(charIndex - 1);
      const delay = char === "\n" ? 220 : (char === "." || char === "!" ? 180 : 28);
      typewriterTimeout = setTimeout(typeNextChar, delay);
    } else {
      typewriterFinished = true;
      if (cursor) cursor.style.display = "none";
    }
  }

  setTimeout(typeNextChar, 400);
}

function completeTypewriterInstantly() {
  if (typewriterTimeout) clearTimeout(typewriterTimeout);
  const target = document.getElementById("typewriter-content");
  const cursor = document.getElementById("typewriter-cursor");
  if (target) target.textContent = CONFIG.messages.letter;
  if (cursor) cursor.style.display = "none";
  typewriterFinished = true;
}


// ====================================================================
// 10. SCREEN 5: "PICK ONE, CHAKSHU" & SUBVIEWS
// ====================================================================
function openSubview(subviewId, itemKey) {
  const subview = document.getElementById(subviewId);
  if (subview) {
    subview.classList.remove("hidden");
  }

  // Mark as opened
  if (itemKey) {
    openedPickItems.add(itemKey);
    const card = document.getElementById(`pick-item-${itemKey}`);
    const badge = document.getElementById(`badge-${itemKey}`);
    if (card) card.classList.add("opened");
    if (badge) badge.textContent = "Opened ✓";

    // Check if all 3 items have been opened
    if (openedPickItems.size >= 3) {
      const oneLastThingWrap = document.getElementById("one-last-thing-wrap");
      if (oneLastThingWrap) {
        oneLastThingWrap.classList.remove("hidden");
        oneLastThingWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }
}

function closeSubview(subviewId) {
  const subview = document.getElementById(subviewId);
  if (subview) {
    subview.classList.add("hidden");
  }
}

function handleGiftBoxOpen() {
  const giftBox = document.getElementById("large-gift-box");
  const giftHint = document.getElementById("gift-tap-hint");
  const revealedContent = document.getElementById("gift-revealed-content");

  if (!giftBox || giftBox.classList.contains("opened")) return;

  giftBox.classList.remove("shake-animation");
  giftBox.classList.add("opened");
  if (giftHint) giftHint.classList.add("hidden");

  // Launch confetti cannons inside gift modal
  triggerModalConfetti();

  if (revealedContent) {
    revealedContent.classList.remove("hidden");
  }
}

function triggerModalConfetti() {
  const container = document.getElementById("gift-confetti-cannon");
  if (!container) return;

  const colors = ["#ff5964", "#f4acb7", "#ffe5d9", "#d8e2dc", "#ffd166", "#06d6a0"];
  for (let i = 0; i < 40; i++) {
    const confetti = document.createElement("div");
    confetti.style.position = "absolute";
    confetti.style.width = `${Math.random() * 8 + 5}px`;
    confetti.style.height = `${Math.random() * 12 + 6}px`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.borderRadius = "2px";
    confetti.style.pointerEvents = "none";
    confetti.style.left = "50%";
    confetti.style.top = "50%";

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 140 + 60;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity - 40;

    confetti.style.transition = "all 1s cubic-bezier(0.25, 1, 0.5, 1)";
    container.appendChild(confetti);

    requestAnimationFrame(() => {
      confetti.style.transform = `translate(${vx}px, ${vy}px) rotate(${Math.random() * 720}deg)`;
      confetti.style.opacity = "0";
    });

    setTimeout(() => confetti.remove(), 1100);
  }
}


// ====================================================================
// 11. LIGHTBOX MODAL FOR ZOOMING MEMORIES
// ====================================================================
function openLightbox(index) {
  lightboxIndex = index;
  const modal = document.getElementById("lightbox-modal");
  const img = document.getElementById("lightbox-img");
  const caption = document.getElementById("lightbox-caption");

  const photo = CONFIG.photos[lightboxIndex] || { url: `assets/photos/${lightboxIndex + 1}.jpg`, caption: "", rotate: 0 };

  if (img) {
    img.src = photo.url;
    img.style.transform = `rotate(${photo.rotate || 0}deg) scale(${photo.scale || 1})`;
    img.style.objectFit = 'cover';
  }
  if (caption) {
    caption.textContent = photo.caption || `Memory #${lightboxIndex + 1}`;
  }
  if (modal) {
    modal.classList.remove("hidden");
  }
}

function closeLightbox() {
  const modal = document.getElementById("lightbox-modal");
  if (modal) modal.classList.add("hidden");
}

function navigateLightbox(dir) {
  const total = CONFIG.photos.length;
  lightboxIndex = (lightboxIndex + dir + total) % total;
  openLightbox(lightboxIndex);
}


// ====================================================================
// 12. SCREEN 6: RUNAWAY "NO" BUTTON & "YES" CELEBRATION
// ====================================================================
function setupQuestionCard() {
  const btnNo = document.getElementById("btn-choice-no");
  const btnYes = document.getElementById("btn-choice-yes");
  const wrongSticker = document.getElementById("wrong-button-sticker");
  const choicesContainer = document.getElementById("choices-container");

  if (!btnNo) return;

  let moveCount = 0;

  // Run away on hover, mouse move, pointerdown, or touch
  function dodgeButton(e) {
    if (e) e.preventDefault();
    moveCount++;

    const containerRect = choicesContainer ? choicesContainer.getBoundingClientRect() : { width: 300, height: 100 };
    const maxX = Math.max(30, containerRect.width - 120);
    const maxY = Math.max(20, containerRect.height - 50);

    // Calculate a new random offset away from cursor
    const randomX = (Math.random() - 0.5) * maxX;
    const randomY = (Math.random() - 0.5) * maxY;

    btnNo.style.position = "relative";
    btnNo.style.transform = `translate(${randomX}px, ${randomY}px) scale(0.95)`;

    // If she taps repeatedly or touches it
    if (moveCount > 2 && wrongSticker) {
      wrongSticker.classList.remove("hidden");
    }
  }

  btnNo.addEventListener("mouseenter", dodgeButton);
  btnNo.addEventListener("mousemove", dodgeButton);
  btnNo.addEventListener("touchstart", (e) => {
    dodgeButton(e);
  }, { passive: false });

  btnNo.addEventListener("click", (e) => {
    e.preventDefault();
    dodgeButton(e);
    if (wrongSticker) {
      wrongSticker.classList.remove("hidden");
    }
  });

  // Option YES clicked: Massive celebration!
  if (btnYes) {
    btnYes.addEventListener("click", handleYesClicked);
  }
}

function handleYesClicked() {
  const questionCard = document.getElementById("question-card");
  const celebrationContainer = document.getElementById("celebration-container");

  if (questionCard) questionCard.classList.add("hidden");
  if (celebrationContainer) celebrationContainer.classList.remove("hidden");

  // Massive Confetti & Heart Burst
  launchMassiveCelebration();
}

function launchMassiveCelebration() {
  const canvas = document.getElementById("scrapbook-canvas");
  if (canvas && window.scrapbookAddCelebrationBurst) {
    window.scrapbookAddCelebrationBurst();
  }
}

function resetStory() {
  const questionCard = document.getElementById("question-card");
  const celebrationContainer = document.getElementById("celebration-container");
  const envWrapper = document.getElementById("envelope-wrapper");

  if (celebrationContainer) celebrationContainer.classList.add("hidden");
  if (questionCard) questionCard.classList.remove("hidden");
  if (envWrapper) envWrapper.classList.remove("opened");

  const btnNo = document.getElementById("btn-choice-no");
  if (btnNo) {
    btnNo.style.transform = "none";
  }

  const wrongSticker = document.getElementById("wrong-button-sticker");
  if (wrongSticker) wrongSticker.classList.add("hidden");

  goToScreen(1);
}


// ====================================================================
// 13. AUDIO ENGINE & SYNTHESIZER FALLBACK
// ====================================================================
function setupAudio() {
  const audio = document.getElementById("bg-music");
  if (audio) {
    audio.src = CONFIG.song.src;
    audio.addEventListener("timeupdate", updateSpotifyProgressBar);
    audio.addEventListener("ended", () => {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    });
  }
}

function startMusic() {
  const audio = document.getElementById("bg-music");
  isMusicPlaying = true;
  updateMusicUIState(true);

  if (audio) {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback: If audio file is missing or fails to decode, run Web Audio Synth!
        startWebAudioMusicBox();
      });
    }
  } else {
    startWebAudioMusicBox();
  }
}

function toggleMusic() {
  const audio = document.getElementById("bg-music");
  if (isMusicPlaying) {
    isMusicPlaying = false;
    updateMusicUIState(false);
    if (audio) audio.pause();
    stopWebAudioMusicBox();
  } else {
    startMusic();
  }
}

function updateMusicUIState(playing) {
  const musicToggle = document.getElementById("global-music-toggle");
  const vinylDisc = document.querySelector(".vinyl-disc");
  const vinylIcon = document.getElementById("vinyl-status-icon");

  if (musicToggle) {
    if (playing) musicToggle.classList.add("playing");
    else musicToggle.classList.remove("playing");
  }

  if (vinylDisc) {
    if (playing) vinylDisc.classList.add("playing");
    else vinylDisc.classList.remove("playing");
  }

  if (vinylIcon) {
    vinylIcon.textContent = playing ? "⏸" : "▶";
  }
}

function updateSpotifyProgressBar() {
  const audio = document.getElementById("bg-music");
  const progressFill = document.getElementById("spotify-progress-fill");
  const timeCurrent = document.getElementById("time-current");
  const timeTotal = document.getElementById("time-total");

  if (!audio || !progressFill) return;

  const cur = audio.currentTime || 0;
  const dur = audio.duration || 220; // fallback default 3:40

  const pct = (cur / dur) * 100;
  progressFill.style.width = `${Math.min(pct, 100)}%`;

  if (timeCurrent) {
    const mins = Math.floor(cur / 60);
    const secs = Math.floor(cur % 60);
    timeCurrent.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  if (timeTotal && !isNaN(audio.duration)) {
    const dMins = Math.floor(dur / 60);
    const dSecs = Math.floor(dur % 60);
    timeTotal.textContent = `${dMins}:${dSecs < 10 ? '0' : ''}${dSecs}`;
  }
}

/**
 * Romantic Music Box Synthesizer (Web Audio API)
 * Plays a warm, soothing romantic melody if no mp3 is present
 */
function startWebAudioMusicBox() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioContext) audioContext = new AudioCtx();
    if (audioContext.state === "suspended") audioContext.resume();

    stopWebAudioMusicBox();

    // Romantic melody note frequencies (in Hz)
    const melody = [
      261.63, 329.63, 392.00, 523.25, 493.88, 392.00, 329.63,
      349.23, 440.00, 523.25, 440.00, 392.00, 329.63, 293.66,
      261.63, 329.63, 392.00, 440.00, 392.00, 349.23, 329.63,
      293.66, 329.63, 349.23, 392.00, 329.63, 293.66, 261.63
    ];
    let noteIdx = 0;

    synthInterval = setInterval(() => {
      if (!isMusicPlaying) return;
      playMusicBoxNote(melody[noteIdx % melody.length]);
      noteIdx++;
    }, 450);
  } catch (e) {
    console.warn("AudioContext error:", e);
  }
}

function playMusicBoxNote(freq) {
  if (!audioContext) return;
  try {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioContext.currentTime);

    gain.gain.setValueAtTime(0.08, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start();
    osc.stop(audioContext.currentTime + 1.25);
  } catch (e) {}
}

function stopWebAudioMusicBox() {
  if (synthInterval) {
    clearInterval(synthInterval);
    synthInterval = null;
  }
}


// ====================================================================
// 14. 60FPS BACKGROUND CANVAS: FLOATING HEARTS & FALLING PETALS
// ====================================================================
function setupCanvas() {
  const canvas = document.getElementById("scrapbook-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const maxParticles = 28;

  class ScrapParticle {
    constructor(isBurst = false) {
      this.reset(isBurst);
    }

    reset(isBurst = false) {
      this.isPetal = Math.random() > 0.45;
      this.isBurst = isBurst;

      this.x = Math.random() * width;
      this.y = isBurst ? height * 0.5 + (Math.random() - 0.5) * 100 : Math.random() * height;

      if (this.isPetal) {
        // Petal falls downward with sway
        this.vy = Math.random() * 0.8 + 0.4;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.size = Math.random() * 8 + 6;
        this.color = Math.random() > 0.5 ? "rgba(255, 182, 193, 0.45)" : "rgba(248, 165, 181, 0.5)";
      } else {
        // Heart floats upward softly
        this.vy = -(Math.random() * 0.7 + 0.35);
        this.vx = (Math.random() - 0.5) * 0.4;
        this.size = Math.random() * 10 + 8;
        this.color = Math.random() > 0.5 ? "rgba(225, 45, 75, 0.4)" : "rgba(255, 105, 135, 0.45)";
      }

      if (isBurst) {
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.8) * 8;
        this.size = Math.random() * 14 + 10;
      }

      this.angle = Math.random() * Math.PI * 2;
      this.angularSpeed = (Math.random() - 0.5) * 0.03;
      this.opacity = Math.random() * 0.4 + 0.3;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.angle += this.angularSpeed;

      if (this.isBurst) {
        this.vy += 0.08; // gravity for burst
        this.opacity -= 0.008;
        return;
      }

      // Loop particles seamlessly
      if (this.isPetal && this.y > height + 20) {
        this.y = -20;
        this.x = Math.random() * width;
      } else if (!this.isPetal && this.y < -20) {
        this.y = height + 20;
        this.x = Math.random() * width;
      }

      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
    }

    draw(c) {
      if (this.opacity <= 0) return;
      c.save();
      c.translate(this.x, this.y);
      c.rotate(this.angle);
      c.globalAlpha = Math.max(0, this.opacity);

      if (this.isPetal) {
        // Draw delicate botanical petal
        c.fillStyle = this.color;
        c.beginPath();
        c.ellipse(0, 0, this.size, this.size * 0.55, 0, 0, Math.PI * 2);
        c.fill();
      } else {
        // Draw soft heart
        c.fillStyle = this.color;
        c.beginPath();
        const s = this.size * 0.5;
        c.moveTo(0, s * 0.3);
        c.bezierCurveTo(-s, -s * 0.7, -s * 1.5, s * 0.4, 0, s * 1.4);
        c.bezierCurveTo(s * 1.5, s * 0.4, s, -s * 0.7, 0, s * 0.3);
        c.fill();
      }

      c.restore();
    }
  }

  // Initialize pool of ambient particles
  for (let i = 0; i < maxParticles; i++) {
    particles.push(new ScrapParticle());
  }

  // Hook for celebration burst
  window.scrapbookAddCelebrationBurst = function() {
    for (let i = 0; i < 90; i++) {
      particles.push(new ScrapParticle(true));
    }
  };

  // Main 60fps render loop
  function loop() {
    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw(ctx);
      if (p.isBurst && p.opacity <= 0) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
