// Wrapped in a check so it only runs if RPG mode is active
chrome.storage.sync.get(['extensionMode'], (result) => {
  if (result.extensionMode === 'rpg') {
    
    console.log("Calendar Level Up Extension Loaded! 🚀");

    // --- SETTINGS (Easier Leveling) ---
    const XP_PER_TASK = 20;
    const BASE_XP_FOR_LEVEL_UP = 300; // Fixed 300 XP per level
    const XP_INCREASE_PER_LEVEL = 0;  // No increase per level

    // --- COLOR GRADIENTS (Updates every 5 levels) ---
    const colorTiers = [
      'linear-gradient(90deg, #FF512F, #DD2476)', // Levels 1-4
      'linear-gradient(90deg, #8E2DE2, #4A00E0)', // Levels 5-9
      'linear-gradient(90deg, #e65c00, #F9D423)', // Levels 10-14
      'linear-gradient(90deg, #11998e, #38ef7d)', // Levels 15-19
      'linear-gradient(90deg, #FC466B, #3F5EFB)', // Levels 20-24
      'linear-gradient(90deg, #00d2ff, #3a7bd5)', // Levels 25-29
      'linear-gradient(90deg, #f2709c, #ff9472)', // Levels 30-34
      'linear-gradient(90deg, #c31432, #240b36)', // Levels 35-39
      'linear-gradient(90deg, #FFD700, #FDB931)', // Levels 40-44
      'linear-gradient(90deg, #E0E0E0, #BDBDBD)', // Levels 45-49
      'linear-gradient(90deg, #B24592, #F15F79)', // Levels 50-54
      'linear-gradient(90deg, #00F260, #0575E6)', // Levels 55-59
      'linear-gradient(90deg, #ff9966, #ff5e62)', // Levels 60-64
      'linear-gradient(90deg, #43cea2, #185a9d)', // Levels 65-69
      'linear-gradient(90deg, #4568DC, #B06AB3)', // Levels 70-74
      'linear-gradient(90deg, #3a1c71, #d76d77)', // Levels 75-79
      'linear-gradient(90deg, #c21500, #ffc500)', // Levels 80-84
      'linear-gradient(90deg, #00c6ff, #0072ff)', // Levels 85-89
      'linear-gradient(90deg, #1D976C, #93F9B9)', // Levels 90-94
      'linear-gradient(90deg, #833ab4, #fd1d1d, #fcb045)', // Levels 95+
    ];

    // --- SOUND & CELEBRATION LOGIC ---
    function playTaskCompleteSound() {
      const soundUrl = chrome.runtime.getURL('assets/plinker.mp3');
      const audio = new Audio(soundUrl);
      audio.volume = 0.1;
      audio.play().catch(e => console.error("Error playing task sound:", e));
    }

    function levelUpCelebration(isMilestone = false) {
      const soundFile = isMilestone ? 'assets/10-levels.mp3' : 'assets/level_up.mp3';
      const soundUrl = chrome.runtime.getURL(soundFile);
      const audio = new Audio(soundUrl);
      audio.volume = 0.03;
      audio.play().catch(e => console.error("Error playing level up sound:", e));

      // The visual celebration effects
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

    // --- UI CREATION ---
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
      // Always returns 300 XP for the next level
      return 300;
    }

    function updateUI(level, xp, xpForNextLevel) {
      levelText.textContent = `Level ${level}`;
      xpText.textContent = `${xp} / ${xpForNextLevel} XP`;
      const percentage = xpForNextLevel > 0 ? (xp / xpForNextLevel) * 100 : 0;
      barFill.style.width = `${percentage}%`;

      // Logic to select color based on level (Every 5 levels now)
      const tierIndex = Math.floor((level - 1) / 5);
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

    // --- UPDATED EVENT LISTENER ---
    document.body.addEventListener('click', function(event) {
      // 1. Check for the original sidebar task list button
      const listButton = event.target.closest('button[data-completed="false"]');
      
      // 2. Check for the detailed view "Mark complete" button
      const detailButton = event.target.closest('button[aria-label="Mark complete"]');
      
      // If neither was clicked, stop the function
      if (!listButton && !detailButton) return;

      playTaskCompleteSound();
      
      chrome.storage.sync.get(['playerLevel', 'playerXP'], (data) => {
        let level = data.playerLevel || 1;
        let xp = data.playerXP || 0;
        
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
          // Milestone check changed to every 5 levels
          const isMilestone = Math.floor(oldLevel / 5) < Math.floor(level / 5);
          levelUpCelebration(isMilestone); 
        }

        chrome.storage.sync.set({ playerLevel: level, playerXP: xp }, () => {
          updateUI(level, xp, xpForNextLevel);
        });
      });
    });

  } // End of RPG mode check
});