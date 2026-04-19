// Wrapped in a check so it only runs if Pomodoro mode is active
chrome.storage.sync.get(['extensionMode'], (result) => {
  if (result.extensionMode === 'pomodoro') {
    console.log("Pomodoro Timer Mode Loaded! 🍅");

    const POMODORO_TIME = 25 * 60; // 25 minutes in seconds
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
      width: '480px',
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
      justifyContent: 'space-between'
    });

    const leftSection = document.createElement('div');
    Object.assign(leftSection.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    });

    const titleText = document.createElement('div');
    titleText.textContent = 'Pomodoro Timer';
    titleText.style.fontWeight = 'bold';
    titleText.style.fontSize = '14px';
    titleText.style.color = '#ff6347'; // Tomato color

    const timeDisplay = document.createElement('div');
    timeDisplay.textContent = formatTime(timeLeft);
    timeDisplay.style.fontWeight = 'bold';
    timeDisplay.style.fontSize = '22px';
    timeDisplay.style.fontFamily = 'monospace';
    timeDisplay.style.color = '#e8eaed';

    leftSection.appendChild(titleText);
    leftSection.appendChild(timeDisplay);

    const controlsContainer = document.createElement('div');
    Object.assign(controlsContainer.style, {
      display: 'flex',
      gap: '8px'
    });

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
    startBtn.textContent = 'Start';
    Object.assign(startBtn.style, btnStyle);
    
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    Object.assign(resetBtn.style, btnStyle);

    // Hover effects
    startBtn.onmouseover = () => startBtn.style.background = '#3c4043';
    startBtn.onmouseout = () => { if (!isRunning) startBtn.style.background = 'transparent'; };
    resetBtn.onmouseover = () => resetBtn.style.background = '#3c4043';
    resetBtn.onmouseout = () => resetBtn.style.background = 'transparent';

    controlsContainer.appendChild(startBtn);
    controlsContainer.appendChild(resetBtn);

    pomodoroContainer.appendChild(leftSection);
    pomodoroContainer.appendChild(controlsContainer);
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

    function updateDisplay() {
      timeDisplay.textContent = formatTime(timeLeft);
    }

    function toggleTimer() {
      if (isRunning) {
        clearInterval(timerInterval);
        startBtn.textContent = 'Start';
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
            startBtn.textContent = 'Start';
            startBtn.style.background = 'transparent';
            startBtn.style.color = '#9aa0a6';
            startBtn.style.borderColor = '#5f6368';
            playSound();
            alert("Pomodoro Complete! Take a break.");
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
      startBtn.textContent = 'Start';
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