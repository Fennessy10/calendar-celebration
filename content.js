console.log("Calendar Level Up Extension Loaded! 🚀");

// --- SETTINGS (Easier Leveling) ---
const XP_PER_TASK = 20;
const BASE_XP_FOR_LEVEL_UP = 80;
const XP_INCREASE_PER_LEVEL = 30;

// --- COLOR GRADIENTS ---
const colorTiers = [
  'linear-gradient(90deg, #4285F4, #90b8f8)', // Levels 1-9 (Blue)
  'linear-gradient(90deg, #34A853, #81c995)', // Levels 10-19 (Green)
  'linear-gradient(90deg, #FBBC04, #fdd663)', // Levels 20-29 (Yellow)
  'linear-gradient(90deg, #EA4335, #f28b82)', // Levels 30-39 (Red)
  'linear-gradient(90deg, #9b59b6, #c39bd3)', // Levels 40-49 (Purple)
  'linear-gradient(90deg, #e67e22, #f0b27a)', // Levels 50-59 (Orange)
  'linear-gradient(90deg, #1abc9c, #76d7c4)', // Levels 60-69 (Turquoise)
  'linear-gradient(90deg, #f1c40f, #f7dc6f)', // Levels 70-79 (Gold)
  'linear-gradient(90deg, #bdc3c7, #e0e0e0)', // Levels 80-89 (Silver)
  'linear-gradient(90deg, #00A896, #02C39A)', // Levels 90-99 (Teal)
  'linear-gradient(90deg, #d63384, #ff69b4)', // Levels 100-109 (Magenta)
  'linear-gradient(90deg, #483D8B, #6A5ACD)', // Levels 110-119 (Cosmic Blue)
  'linear-gradient(90deg, #FF4E50, #F9D423)', // Levels 120-129 (Sunset Fire)
  'linear-gradient(90deg, #00c6ff, #0072ff)', // Levels 130+ (Deep Sky)
];


// --- SOUND & CELEBRATION LOGIC ---
function playTaskCompleteSound() {
  // CHANGED! - Swapped 'success.mp3' for 'plink.mp3'
  const soundUrl = chrome.runtime.getURL('assets/plink.mp3');
  const audio = new Audio(soundUrl);
  audio.volume = 0.1;
  audio.play().catch(e => console.error("Error playing task sound:", e));
}

// CHANGED! - Added an 'isMilestone' parameter to select the correct level up sound
function levelUpCelebration(isMilestone = false) {
  // CHANGED! - Logic to choose between the milestone sound and the regular level up sound
  const soundFile = isMilestone ? 'assets/10-levels.mp3' : 'assets/level_up.mp3';
  const soundUrl = chrome.runtime.getURL(soundFile);
  const audio = new Audio(soundUrl);
  audio.volume = 0.03;
  audio.play().catch(e => console.error("Error playing level up sound:", e));

  // The visual celebration effects remain the same
  progressBarContainer.classList.add('level-up-flash');
  setTimeout(() => {
    progressBarContainer.classList.remove('level-up-flash');
  }, 800);

  if (typeof confetti === 'function') {
    confetti({ particleCount: 200, spread: 80, origin: { x: 0.3, y: 0.6 }, zIndex: 9999 });
    setTimeout(() => {
        confetti({ particleCount: 200, spread: 80, origin: { x: 0.7, y: 0.6 }, zIndex: 9999 });
    }, 200);
  } else {
    console.error("Confetti library is not loaded.");
  }
}

// --- UI CREATION (NEW & IMPROVED DESIGN) ---
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @keyframes levelUpFlash {
    0% {
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(255, 215, 0, 0.9);
    }
    100% {
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5), 0 0 30px 0 rgba(255, 215, 0, 0);
    }
  }
  .level-up-flash {
    animation: levelUpFlash 0.8s ease-out;
  }
`;
document.head.appendChild(styleSheet);


const progressBarContainer = document.createElement('div');
Object.assign(progressBarContainer.style, {
  position: 'fixed',
  top: '0',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '400px',
  backgroundColor: '#202124',
  color: 'white',
  borderRadius: '0 0 12px 12px',
  zIndex: '9999',
  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderTop: 'none',
  padding: '12px',
  fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
});

const textContainer = document.createElement('div');
Object.assign(textContainer.style, {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    width: '100%'
});

const levelText = document.createElement('div');
Object.assign(levelText.style, {
    fontWeight: 'bold',
    fontSize: '18px',
    color: '#e8eaed'
});

const xpText = document.createElement('div');
Object.assign(xpText.style, {
  fontSize: '12px',
  color: '#bdc1c6'
});

const barBackground = document.createElement('div');
Object.assign(barBackground.style, {
  width: '100%',
  height: '12px',
  backgroundColor: '#5f6368',
  borderRadius: '6px',
  overflow: 'hidden'
});

const barFill = document.createElement('div');
Object.assign(barFill.style, {
  width: '0%',
  height: '100%',
  borderRadius: '6px',
  transition: 'width 0.5s cubic-bezier(0.25, 1, 0.5, 1), background 0.5s ease'
});

textContainer.appendChild(levelText);
textContainer.appendChild(xpText);
barBackground.appendChild(barFill);
progressBarContainer.appendChild(textContainer);
progressBarContainer.appendChild(barBackground);
document.body.appendChild(progressBarContainer);

// --- HELPER FUNCTIONS ---
function calculateXpForLevel(level) {
  return BASE_XP_FOR_LEVEL_UP + ((level - 1) * XP_INCREASE_PER_LEVEL);
}

function updateUI(level, xp, xpForNextLevel) {
  levelText.textContent = `Level ${level}`;
  xpText.textContent = `${xp} / ${xpForNextLevel} XP`;
  const percentage = xpForNextLevel > 0 ? (xp / xpForNextLevel) * 100 : 0;
  barFill.style.width = `${percentage}%`;

  // Logic to select color based on level
  const tierIndex = Math.floor((level - 1) / 10);
  const color = colorTiers[tierIndex % colorTiers.length];
  barFill.style.background = color;
}

// --- MAIN LOGIC ---
chrome.storage.sync.get(['playerLevel', 'playerXP'], (data) => {
  let level = data.playerLevel || 1;
  let xp = data.playerXP || 0;
  let xpForNextLevel = calculateXpForLevel(level);
  updateUI(level, xp, xpForNextLevel);
});

document.body.addEventListener('click', function(event) {
  const button = event.target.closest('button[data-completed="false"]');
  if (!button) return;

  playTaskCompleteSound();
  
  chrome.storage.sync.get(['playerLevel', 'playerXP'], (data) => {
    let level = data.playerLevel || 1;
    let xp = data.playerXP || 0;
    
    // CHANGED! - Store the original level to check for milestones later
    const oldLevel = level;
    
    xp += XP_PER_TASK;
    let xpForNextLevel = calculateXpForLevel(level);
    let leveledUp = false;

    while (xp >= xpForNextLevel) {
      level++;
      xp -= xpForNextLevel;
      leveledUp = true;
      xpForNextLevel = calculateXpForLevel(level);
    }
    
    if (leveledUp) {
      console.log(`LEVEL UP! Now Level ${level}`);
      // CHANGED! - Check if a 10-level milestone was crossed (e.g., going from 9 to 10, or 19 to 21)
      const isMilestone = Math.floor(oldLevel / 10) < Math.floor(level / 10);
      levelUpCelebration(isMilestone); // Pass the result to the celebration function
    }

    chrome.storage.sync.set({ playerLevel: level, playerXP: xp }, () => {
      updateUI(level, xp, xpForNextLevel);
    });
  });
});