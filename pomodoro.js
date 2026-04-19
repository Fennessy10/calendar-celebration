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
      width: '350px',
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
      gap: '8px'
    });

    const headerContainer = document.createElement('div');
    Object.assign(headerContainer.style, {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%'
    });

    const titleText = document.createElement('div');
    titleText.textContent = 'Pomodoro Timer';
    titleText.style.fontWeight = 'bold';
    titleText.style.fontSize = '14px';
    titleText.style.color = '#ff6347'; // Tomato color

    const timeDisplay = document.createElement('div');
    timeDisplay.textContent = formatTime(timeLeft);
    timeDisplay.style.fontWeight = 'bold';
    timeDisplay.style.fontSize = '24px';
    timeDisplay.style.fontFamily = 'monospace';

    headerContainer.appendChild(titleText);
    headerContainer.appendChild(timeDisplay);

    const controlsContainer = document.createElement('div');
    Object.assign(controlsContainer.style, {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center'
    });

    const btnStyle = {
      background: '#3c4043',
      color: 'white',
      border: 'none',
      padding: '6px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 'bold',
      flex: '1'
    };

    const startBtn = document.createElement('button');
    startBtn.textContent = 'Start';
    Object.assign(startBtn.style, btnStyle);
    
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    Object.assign(resetBtn.style, btnStyle);

    controlsContainer.appendChild(startBtn);
    controlsContainer.appendChild(resetBtn);

    pomodoroContainer.appendChild(headerContainer);
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
        startBtn.style.background = '#3c4043';
        startBtn.style.color = 'white';
      } else {
        if (timeLeft === 0) timeLeft = POMODORO_TIME;
        
        timerInterval = setInterval(() => {
          timeLeft--;
          updateDisplay();

          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            startBtn.textContent = 'Start';
            startBtn.style.background = '#3c4043';
            startBtn.style.color = 'white';
            playSound();
            alert("Pomodoro Complete! Take a break.");
          }
        }, 1000);
        
        startBtn.textContent = 'Pause';
        startBtn.style.background = '#ff6347';
        startBtn.style.color = '#202124';
      }
      isRunning = !isRunning;
    }

    function resetTimer() {
      clearInterval(timerInterval);
      isRunning = false;
      timeLeft = POMODORO_TIME;
      updateDisplay();
      startBtn.textContent = 'Start';
      startBtn.style.background = '#3c4043';
      startBtn.style.color = 'white';
    }

    startBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', resetTimer);

  } else {
    // Cleanup if switching away from Pomodoro mode
    document.getElementById('pomodoro-bar')?.remove();
  }
});