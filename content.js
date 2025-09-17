console.log("Calendar Level Up Extension Loaded! 🚀");

// --- SETTINGS (Easier Leveling) ---
const XP_PER_TASK = 20;
const BASE_XP_FOR_LEVEL_UP = 80; // Lowered from 100
const XP_INCREASE_PER_LEVEL = 30; // Slower ramp-up

// --- SOUND & CELEBRATION LOGIC ---
function playTaskCompleteSound() {
  const soundUrl = chrome.runtime.getURL('assets/success.mp3');
  const audio = new Audio(soundUrl);
  audio.play().catch(e => console.error("Error playing task sound:", e));
}

function levelUpCelebration() {
  // Play the new level up sound
  const soundUrl = chrome.runtime.getURL('assets/level_up.mp3');
  const audio = new Audio(soundUrl);
  audio.play().catch(e => console.error("Error playing level up sound:", e));

  // Show confetti only on level up
  if (typeof confetti === 'function') {
    confetti({ particleCount: 250, spread: 100, origin: { y: 0.6 }, zIndex: 9999 });
  } else {
    console.error("Confetti library is not loaded.");
  }
}

// --- UI CREATION (No changes here) ---
const progressBarContainer = document.createElement('div');
Object.assign(progressBarContainer.style, {
  position: 'fixed',
  top: '15px',
  right: '20px',
  width: '250px',
  backgroundColor: '#3c4043',
  color: 'white',
  borderRadius: '8px',
  zIndex: '9999',
  boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
  padding: '8px',
  fontFamily: 'Roboto, Arial, sans-serif',
  fontSize: '13px'
});

const levelText = document.createElement('div');
levelText.style.fontWeight = 'bold';
const xpText = document.createElement('div');
xpText.style.fontSize = '11px';
xpText.style.textAlign = 'right';

const barBackground = document.createElement('div');
Object.assign(barBackground.style, {
  width: '100%',
  height: '8px',
  backgroundColor: '#5f6368',
  borderRadius: '4px',
  marginTop: '4px',
  overflow: 'hidden'
});

const barFill = document.createElement('div');
Object.assign(barFill.style, {
  width: '0%',
  height: '100%',
  backgroundColor: '#8ab4f8',
  borderRadius: '4px',
  transition: 'width 0.5s ease'
});

barBackground.appendChild(barFill);
progressBarContainer.appendChild(levelText);
progressBarContainer.appendChild(barBackground);
progressBarContainer.appendChild(xpText);
document.body.appendChild(progressBarContainer);

// --- HELPER FUNCTIONS ---
// New, simpler formula for calculating XP needed
function calculateXpForLevel(level) {
  return BASE_XP_FOR_LEVEL_UP + ((level - 1) * XP_INCREASE_PER_LEVEL);
}

function updateUI(level, xp, xpForNextLevel) {
  levelText.textContent = `Level ${level}`;
  xpText.textContent = `${xp} / ${xpForNextLevel} XP`;
  const percentage = xpForNextLevel > 0 ? (xp / xpForNextLevel) * 100 : 0;
  barFill.style.width = `${percentage}%`;
}

// --- MAIN LOGIC ---
// Load initial data from storage
chrome.storage.sync.get(['playerLevel', 'playerXP'], (data) => {
  let level = data.playerLevel || 1;
  let xp = data.playerXP || 0;
  let xpForNextLevel = calculateXpForLevel(level);
  updateUI(level, xp, xpForNextLevel);
});

// Listen for clicks on task completion buttons
document.body.addEventListener('click', function(event) {
  const button = event.target.closest('button[data-completed="false"]');
  if (!button) return;

  // Play the task completion sound immediately
  playTaskCompleteSound();
  
  chrome.storage.sync.get(['playerLevel', 'playerXP'], (data) => {
    let level = data.playerLevel || 1;
    let xp = data.playerXP || 0;
    
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
      levelUpCelebration(); // This now plays level_up.mp3 and shows confetti
    }

    chrome.storage.sync.set({ playerLevel: level, playerXP: xp }, () => {
      updateUI(level, xp, xpForNextLevel);
    });
  });
});