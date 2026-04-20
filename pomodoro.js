// Wrapped in a check so it only runs if Pomodoro mode is active
chrome.storage.sync.get(['extensionMode'], (result) => {
  if (result.extensionMode === 'pomodoro') {
    console.log("Pomodoro Timer Mode Loaded! 🍅");

    let POMODORO_TIME = 25 * 60; // 25 minutes in seconds
    let timeLeft = POMODORO_TIME;
    let timerInterval = null;
    let isRunning = false;

    // --- CREATE UI ---
    const pomodoroContainer = document.createElement('div');
    pomodoroContainer.id = 'pomodoro-bar';
    Object.assign(pomodoroContainer.style, {
      position: 'fixed',
      top: '0',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'max-content',
      backgroundColor: '#202124',
      color: 'white',
      borderRadius: '0 0 12px 12px',
      zIndex: '9999',
      boxShadow: '0 5px 20px rgba(0, 0, 0, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderTop: 'none',
      padding: '12px 20px',
      fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '12px'
    });

    const timeDisplay = document.createElement('div');
    timeDisplay.textContent = formatTime(timeLeft);
    timeDisplay.style.fontWeight = 'bold';
    timeDisplay.style.fontSize = '22px';
    timeDisplay.style.fontFamily = 'monospace';
    timeDisplay.style.color = '#e8eaed';

    const arrowsContainer = document.createElement('div');
    arrowsContainer.style.display = 'flex';
    arrowsContainer.style.flexDirection = 'column';
    arrowsContainer.style.justifyContent = 'center';

    const upArrow = document.createElement('div');
    upArrow.innerHTML = '&#9650;';
    upArrow.style.fontSize = '10px';
    upArrow.style.cursor = 'pointer';
    upArrow.style.color = '#9aa0a6'; // Enabled
    upArrow.style.lineHeight = '1';

    const downArrow = document.createElement('div');
    downArrow.innerHTML = '&#9660;';
    downArrow.style.fontSize = '10px';
    downArrow.style.cursor = 'default';
    downArrow.style.color = '#5f6368'; // Disabled at 25
    downArrow.style.lineHeight = '1';
    downArrow.style.marginTop = '2px';

    arrowsContainer.appendChild(upArrow);
    arrowsContainer.appendChild(downArrow);

    const timeWrapper = document.createElement('div');
    timeWrapper.style.display = 'flex';
    timeWrapper.style.alignItems = 'center';
    timeWrapper.style.gap = '8px';
    timeWrapper.appendChild(timeDisplay);
    timeWrapper.appendChild(arrowsContainer);

    function updateArrowStates() {
      if (POMODORO_TIME === 50 * 60) {
        upArrow.style.color = '#5f6368';
        upArrow.style.cursor = 'default';
        downArrow.style.color = '#9aa0a6';
        downArrow.style.cursor = 'pointer';
      } else {
        upArrow.style.color = '#9aa0a6';
        upArrow.style.cursor = 'pointer';
        downArrow.style.color = '#5f6368';
        downArrow.style.cursor = 'default';
      }
    }

    upArrow.onclick = () => {
      if (POMODORO_TIME === 25 * 60) {
        POMODORO_TIME = 50 * 60;
        if (!isRunning) {
          timeLeft = POMODORO_TIME;
          updateDisplay();
        }
        updateArrowStates();
      }
    };

    downArrow.onclick = () => {
      if (POMODORO_TIME === 50 * 60) {
        POMODORO_TIME = 25 * 60;
        if (!isRunning) {
          timeLeft = POMODORO_TIME;
          updateDisplay();
        }
        updateArrowStates();
      }
    };

    const btnStyle = {
      background: 'transparent',
      color: '#9aa0a6',
      border: '1px solid #5f6368',
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 'bold',
      transition: 'all 0.2s ease'
    };

    const startBtn = document.createElement('button');
    startBtn.textContent = 'Gum';
    Object.assign(startBtn.style, btnStyle);
    
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    Object.assign(resetBtn.style, btnStyle);

    const skyBtn = document.createElement('button');
    skyBtn.textContent = 'Night Sky';
    Object.assign(skyBtn.style, btnStyle);
    // skyBtn.style.marginLeft = '12px'; // Removed the margin left as we reordered

    // Hover effects
    startBtn.onmouseover = () => startBtn.style.background = '#3c4043';
    startBtn.onmouseout = () => { if (!isRunning) startBtn.style.background = 'transparent'; };
    resetBtn.onmouseover = () => resetBtn.style.background = '#3c4043';
    resetBtn.onmouseout = () => resetBtn.style.background = 'transparent';
    skyBtn.onmouseover = () => skyBtn.style.background = '#3c4043';
    skyBtn.onmouseout = () => skyBtn.style.background = 'transparent';
    skyBtn.onclick = () => window.open(chrome.runtime.getURL('sky.html'), '_blank');

    // "night sky" on left, timer, "gum", "reset" on right
    pomodoroContainer.appendChild(skyBtn);
    pomodoroContainer.appendChild(timeWrapper);
    pomodoroContainer.appendChild(startBtn);
    pomodoroContainer.appendChild(resetBtn);

    document.body.appendChild(pomodoroContainer);

    // --- LOGIC ---
    function formatTime(seconds) {
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    }

    function playSound() {
      const soundUrl = chrome.runtime.getURL('assets/10-levels.mp3'); // Re-using an existing sound for alarm
      const audio = new Audio(soundUrl);
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Error playing sound:", e));
    }

    function triggerConfetti() {
      if (typeof window.confetti === 'function') {
        window.confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, zIndex: 10000 });
      } else if (typeof confetti === 'function') {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, zIndex: 10000 });
      }
    }

    function updateDisplay() {
      timeDisplay.textContent = formatTime(timeLeft);
    }

    function toggleTimer() {
      if (isRunning) {
        clearInterval(timerInterval);
        startBtn.textContent = 'Gum';
        startBtn.style.background = 'transparent';
        startBtn.style.color = '#9aa0a6';
        startBtn.style.borderColor = '#5f6368';
      } else {
        if (timeLeft === 0) timeLeft = POMODORO_TIME;
        
        timerInterval = setInterval(() => {
          timeLeft--;
          updateDisplay();

          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            startBtn.textContent = 'Gum';
            startBtn.style.background = 'transparent';
            startBtn.style.color = '#9aa0a6';
            startBtn.style.borderColor = '#5f6368';
            playSound();
            triggerConfetti();
            chrome.storage.local.get(['pomodoroHistory'], (result) => {
              const history = result.pomodoroHistory || {};
              const date = new Date();
              const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              
              if (!Array.isArray(history[key])) {
                const oldCount = typeof history[key] === 'number' ? history[key] : 0;
                history[key] = Array(oldCount).fill(25 * 60);
              }
              history[key].push(POMODORO_TIME);
              
              chrome.storage.local.set({ pomodoroHistory: history });
            });
          }
        }, 1000);
        
        startBtn.textContent = 'Pause';
        startBtn.style.background = '#ff6347';
        startBtn.style.color = '#202124';
        startBtn.style.borderColor = '#ff6347';
      }
      isRunning = !isRunning;
    }

    function resetTimer() {
      clearInterval(timerInterval);
      isRunning = false;
      timeLeft = POMODORO_TIME;
      updateDisplay();
      startBtn.textContent = 'Gum';
      startBtn.style.background = 'transparent';
      startBtn.style.color = '#9aa0a6';
      startBtn.style.borderColor = '#5f6368';
    }

    startBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', resetTimer);

  } else {
    // Cleanup if switching away from Pomodoro mode
    document.getElementById('pomodoro-bar')?.remove();
  }
});