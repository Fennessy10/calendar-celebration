console.log("Calendar Level Up Extension Loaded! 🚀");

// --- SETTINGS (Easier Leveling) ---
const XP_PER_TASK = 20;
const BASE_XP_FOR_LEVEL_UP = 80; // Lowered from 100
const XP_INCREASE_PER_LEVEL = 30; // Slower ramp-up

// --- SOUND & CELEBRATION LOGIC ---
function playTaskCompleteSound() {
  const soundUrl = chrome.runtime.getURL('assets/success.mp3');
  const audio = new Audio(soundUrl);
  audio.volume = 0.1; // Set volume to 50%
  audio.play().catch(e => console.error("Error playing task sound:", e));
}

function levelUpCelebration() {
  // Play the new level up sound
  const soundUrl = chrome.runtime.getURL('assets/level_up.mp3');
  const audio = new Audio(soundUrl);
  audio.volume = 0.5; // Set volume to 50%
  audio.play().catch(e => console.error("Error playing level up sound:", e));

  // Add a visual flash to the progress bar on level up
  progressBarContainer.classList.add('level-up-flash');
  setTimeout(() => {
    progressBarContainer.classList.remove('level-up-flash');
  }, 800);

  // Show confetti only on level up
  if (typeof confetti === 'function') {
    // Fire two bursts of confetti for a bigger effect
    confetti({ particleCount: 200, spread: 80, origin: { x: 0.3, y: 0.6 }, zIndex: 9999 });
    setTimeout(() => {
        confetti({ particleCount: 200, spread: 80, origin: { x: 0.7, y: 0.6 }, zIndex: 9999 });
    }, 200);
  } else {
    console.error("Confetti library is not loaded.");
  }
}

// --- UI CREATION (NEW & IMPROVED DESIGN) ---
// Add CSS for animations to the document's head
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


// Main container for the progress bar
const progressBarContainer = document.createElement('div');
Object.assign(progressBarContainer.style, {
  position: 'fixed',
  top: '0', // Moved to the very top of the screen
  left: '50%', // Centered horizontally
  transform: 'translateX(-50%)', // Adjust for perfect centering
  width: '400px',
  backgroundColor: '#202124',
  color: 'white',
  borderRadius: '0 0 12px 12px', // Only round the bottom corners
  zIndex: '9999',
  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderTop: 'none', // Remove the top border to make it look flush
  padding: '12px',
  fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
});

// Container for the top row of text (Level and XP)
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

// Progress bar itself
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
  // More vibrant gradient
  background: 'linear-gradient(90deg, #4285F4, #90b8f8)',
  borderRadius: '6px',
  transition: 'width 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
});

// Assemble the UI elements
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
      levelUpCelebration();
    }

    chrome.storage.sync.set({ playerLevel: level, playerXP: xp }, () => {
      updateUI(level, xp, xpForNextLevel);
    });
  });
});

