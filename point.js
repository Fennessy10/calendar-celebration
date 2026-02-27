// Wrapped in a check so it only runs if PB mode is active (or default)
chrome.storage.sync.get(['extensionMode'], (result) => {
  if (!result.extensionMode || result.extensionMode === 'pb') {

    console.log("Daily PB Chaser Extension Loaded! 🏆");

    // --- CONFIGURATION ---
    const DEFAULT_POINTS = 1;
    const SOUND_VOLUME = 0.2;

    // --- GRADIENTS ---
    const PROGRESS_GRADIENT = 'linear-gradient(90deg, #11998e, #38ef7d)'; // Green/Teal (Standard)
    const MATCH_GRADIENT = 'linear-gradient(90deg, #FF8008, #FFC837)'; // Orange (Matching Goal)
    const SURPASS_GRADIENT = 'linear-gradient(124deg, #ff2400, #e81d1d, #e8b71d, #e3e81d, #1de840, #1ddde8, #2b1de8, #dd00f3, #dd00f3)'; // Rainbow (Reached/Surpassing Goal)

    // --- SOUNDS ---
    function playSound(type) {
      let file = 'assets/plinker.mp3'; // Default
      if (type === 'levelup') file = 'assets/level_up.mp3';
      if (type === 'major') file = 'assets/10-levels.mp3';

      const soundUrl = chrome.runtime.getURL(file);
      const audio = new Audio(soundUrl);
      audio.volume = SOUND_VOLUME;
      audio.play().catch(e => console.log("Audio play failed (user interaction needed first?)", e));
    }

    function triggerConfetti() {
      if (typeof confetti === 'function') {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
      }
    }

    // --- UI INJECTION ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      .pb-tracker-container {
        position: fixed;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 480px;
        background-color: #202124;
        color: white;
        border-radius: 0 0 12px 12px;
        z-index: 9999;
        box-shadow: 0 5px 20px rgba(0,0,0,0.6);
        border: 1px solid rgba(255,255,255,0.1);
        border-top: none;
        padding: 15px;
        font-family: 'Google Sans', Roboto, sans-serif;
        display: flex;
        flex-direction: column;
        gap: 8px;
        transition: all 0.3s ease;
      }
      
      .pb-tracker-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
      }

      .pb-score-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .pb-score-area {
        font-size: 20px;
        font-weight: bold;
        color: #e8eaed;
        transition: color 0.3s;
      }
      
      /* Rainbow Text Effect */
      .rainbow-text {
        background: ${SURPASS_GRADIENT};
        background-size: 400% 400%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: rainbowShift 6s ease infinite;
      }

      .pb-icon-btn {
        font-size: 14px;
        color: #9aa0a6;
        background: transparent;
        border: 1px solid #5f6368;
        border-radius: 4px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        padding: 0;
      }

      .pb-icon-btn:hover {
        color: #e8eaed;
        border-color: #bdc1c6;
        background-color: rgba(255,255,255,0.1);
        transform: scale(1.05);
      }

      .pb-target-area {
        font-size: 13px;
        color: #bdc1c6;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .pb-target-area.rainbow-text {
        font-weight: bold;
      }

      .pb-bar-bg {
        width: 100%;
        height: 10px;
        background: #3c4043;
        border-radius: 5px;
        overflow: hidden;
        position: relative;
      }

      .pb-bar-fill {
        height: 100%;
        width: 0%;
        border-radius: 5px;
        transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        background: ${PROGRESS_GRADIENT};
        background-size: 200% 200%;
      }
      
      .rainbow-bar {
        animation: rainbowShift 4s ease infinite;
      }

      @keyframes rainbowShift { 
        0%{background-position:0% 50%}
        50%{background-position:100% 50%}
        100%{background-position:0% 50%}
      }
    `;
    document.head.appendChild(styleSheet);

    // Create Tracker Elements
    const container = document.createElement('div');
    container.className = 'pb-tracker-container';

    const header = document.createElement('div');
    header.className = 'pb-tracker-header';

    // Wrapper for score and buttons
    const scoreWrapper = document.createElement('div');
    scoreWrapper.className = 'pb-score-wrapper';

    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'pb-score-area';
    scoreDisplay.innerText = '0 pts';
    scoreDisplay.style.marginRight = '8px';

    // Statistics Button
    const statsBtn = document.createElement('button');
    statsBtn.className = 'pb-icon-btn';
    statsBtn.innerHTML = '📊'; 
    statsBtn.title = "View Statistics";
    statsBtn.onclick = (e) => {
      e.stopPropagation();
      window.open(chrome.runtime.getURL('statistics.html'), '_blank');
    };

    // Reset Button
    const resetBtn = document.createElement('button');
    resetBtn.className = 'pb-icon-btn';
    resetBtn.innerHTML = '↺';
    resetBtn.title = "Reset Daily Score";
    resetBtn.onclick = (e) => {
      e.stopPropagation(); 
      if (confirm("Reset daily points to 0?")) {
        chrome.storage.sync.set({ dailyScore: 0 }, () => {
          chrome.storage.sync.get(['customGoal'], (data) => {
            updateUI(0, data.customGoal || 15);
          });
        });
      }
    };

    scoreWrapper.appendChild(scoreDisplay);
    scoreWrapper.appendChild(statsBtn);
    scoreWrapper.appendChild(resetBtn);

    const targetDisplay = document.createElement('div');
    targetDisplay.className = 'pb-target-area';
    targetDisplay.innerText = 'Target: 15';

    const barBg = document.createElement('div');
    barBg.className = 'pb-bar-bg';

    const barFill = document.createElement('div');
    barFill.className = 'pb-bar-fill';

    barBg.appendChild(barFill);
    header.appendChild(scoreWrapper);
    header.appendChild(targetDisplay);
    container.appendChild(header);
    container.appendChild(barBg);
    document.body.appendChild(container);

    // --- STATE MANAGEMENT ---
    function getBusinessDateString() {
      const now = new Date();
      if (now.getHours() < 3) {
        now.setDate(now.getDate() - 1);
      }
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    function updateUI(dailyScore, customGoal) {
      scoreDisplay.innerText = `${dailyScore} pts`;
      
      // Reset styles
      scoreDisplay.className = 'pb-score-area';
      targetDisplay.className = 'pb-target-area';
      scoreDisplay.style.color = '#e8eaed';
      targetDisplay.style.color = '#bdc1c6';
      barFill.className = 'pb-bar-fill';
      
      let label = `Goal: ${customGoal}`;
      let barColor = PROGRESS_GRADIENT;

      // --- LOGIC TREE (Strictly tracking Custom Goal) ---

      // 1. Reached or Surpassed Custom Goal
      if (dailyScore >= customGoal && customGoal > 0) {
          label = dailyScore > customGoal ? `Goal Surpassed!` : `Goal Reached! (${customGoal})`;
          barColor = SURPASS_GRADIENT;
          
          scoreDisplay.classList.add('rainbow-text');
          targetDisplay.classList.add('rainbow-text');
          barFill.classList.add('rainbow-bar');
      }
      // 2. Normal Chase (Green)
      else {
          label = `Goal: ${customGoal}`;
          barColor = PROGRESS_GRADIENT;
      }

      // Update DOM
      targetDisplay.innerText = label;
      
      let percentage = 0;
      if (customGoal > 0) {
        percentage = (dailyScore / customGoal) * 100;
      }
      const displayWidth = Math.min(percentage, 100);
      
      barFill.style.width = `${displayWidth}%`;
      barFill.style.background = barColor;
    }

    function loadAndResetIfNeeded() {
      chrome.storage.sync.get(['dailyScore', 'customGoal', 'lastActiveDate', 'history'], (data) => {
        const todayBusinessDate = getBusinessDateString();
        
        let score = data.dailyScore || 0;
        let currentGoal = data.customGoal || 15;
        let history = data.history || [];
        
        const lastDate = data.lastActiveDate || todayBusinessDate;

        // 1. Daily Reset (3AM rule)
        if (lastDate !== todayBusinessDate) {
          const exists = history.find(h => h.date === lastDate);
          if (!exists && score > 0) {
            history.push({ date: lastDate, score: score });
          }
          score = 0;
        }

        chrome.storage.sync.set({
          dailyScore: score,
          customGoal: currentGoal,
          lastActiveDate: todayBusinessDate,
          history: history
        });

        updateUI(score, currentGoal);
      });
    }

    // --- TASK PARSING ---
    function extractPointsFromText(text) {
      if (!text) return DEFAULT_POINTS;
      let match = text.match(/\{(\d+)\}(?=\s*(\n|$))/);
      if (!match) {
        const allMatches = [...text.matchAll(/\{(\d+)\}/g)];
        if (allMatches.length > 0) {
           const lastMatch = allMatches[allMatches.length - 1];
           return parseInt(lastMatch[1], 10);
        }
      }
      if (match && match[1]) return parseInt(match[1], 10);
      return DEFAULT_POINTS;
    }

    // --- CLICK HANDLER (COMPLETION) ---
    document.body.addEventListener('click', function(event) {
      const target = event.target;

      // 1. IDENTIFY CLICKED ELEMENT
      const sidebarCheckbox = target.closest('[role="checkbox"]'); 
      const listButton = target.closest('button[data-completed="false"]');
      const detailButtonLabel = target.closest('button[aria-label="Mark complete"]');
      const detailButtonText = target.closest('button');
      const isDetailTextMatch = detailButtonText && detailButtonText.innerText.includes("Mark completed");

      const triggeredElement = listButton || sidebarCheckbox || detailButtonLabel || (isDetailTextMatch ? detailButtonText : null);

      if (!triggeredElement) return;

      // 2. FIND TASK TITLE
      let taskTitle = "";
      let textSource = null;

      const taskContainer = triggeredElement.closest('[data-taskid]');
      if (taskContainer) textSource = taskContainer;
      else if (triggeredElement.closest('[role="listitem"]')) textSource = triggeredElement.closest('[role="listitem"]');
      else if (triggeredElement.closest('.kma42e')) textSource = triggeredElement.closest('.kma42e');
      else {
        let candidate = triggeredElement.parentElement;
        for (let i = 0; i < 4; i++) {
            if (candidate && candidate.innerText && candidate.innerText.length > 3) {
                textSource = candidate;
                break;
            }
            if (candidate) candidate = candidate.parentElement;
        }
      }

      if (textSource) {
        const specificHeading = textSource.querySelector('[role="heading"]');
        if (specificHeading) taskTitle = specificHeading.innerText;
        else taskTitle = textSource.innerText;
      }

      // 3. CALCULATE AND AWARD POINTS
      const pointsEarned = extractPointsFromText(taskTitle);
      console.log(`Task Completed. Title Found: "${taskTitle.substring(0, 30)}..." | Points Earned: ${pointsEarned}`);

      playSound('success');

      chrome.storage.sync.get(['dailyScore', 'personalBest', 'customGoal', 'lastActiveDate'], (data) => {
        let score = data.dailyScore || 0;
        let allTimePB = data.personalBest || 5; // Still tracking All Time PB silently for stats page
        let currentGoal = data.customGoal || 15;
        
        // Safety check date
        const todayBusinessDate = getBusinessDateString();
        if (data.lastActiveDate !== todayBusinessDate) score = 0; 
        
        const oldScore = score;
        score += pointsEarned;

        // Ensure All-Time PB is updated in the background
        if (score > allTimePB) {
            allTimePB = score;
        }

        // --- CHECK MILESTONES & SOUNDS (Based ONLY on Custom Goal) ---
        
        if (score >= currentGoal && currentGoal > 0) {
            if (oldScore < currentGoal) {
                // First time reaching or surpassing the goal today
                playSound('major'); // Play "10-levels"
                triggerConfetti();
            } else {
                // Already reached the goal previously today, play normal level_up
                playSound('levelup');
            }
        }

        // Save
        chrome.storage.sync.set({
          dailyScore: score,
          personalBest: allTimePB, // Save silently
          customGoal: currentGoal,
          lastActiveDate: todayBusinessDate
        }, () => {
          updateUI(score, currentGoal);
        });
      });

    }, true);

    // --- INIT ---
    loadAndResetIfNeeded();
    window.addEventListener('focus', loadAndResetIfNeeded);

  } // End PB Mode Check
});