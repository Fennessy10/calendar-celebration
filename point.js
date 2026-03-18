// --- SHARED CONFIG ---
const SOUND_VOLUME = 0.2;
let CURRENT_MODE = 'pb'; // 'pb' or 'rpg'
let CURRENT_DAILY_SCORE_MEM = 0; // Tracks the daily score memory for projection math

// --- SOUNDS ---
function playSound(type) {
  let file = 'assets/plinker.mp3';
  if (type === 'levelup') file = 'assets/level_up.mp3';
  if (type === 'major') file = 'assets/10-levels.mp3';

  const soundUrl = chrome.runtime.getURL(file);
  const audio = new Audio(soundUrl);
  audio.volume = SOUND_VOLUME;
  audio.play().catch(e => {});
}

function triggerConfetti() {
  if (typeof window.confetti === 'function') {
    window.confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, zIndex: 10000 });
  } else if (typeof confetti === 'function') {
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, zIndex: 10000 });
  }
}

// ==========================================
//           SYSTEM 1: DAILY PB CHASER
// ==========================================

const PB_CONFIG = {
  DEFAULT_POINTS: 1,
  MAX_BAR_SCORE: 50,
  TIERS: [
    { min: 0, max: 19, name: "Pathetic", color: '#0e4429' },          // Very dark green
    { min: 20, max: 29, name: "Underwhelming", color: '#006d32' },   // Dark green
    { min: 30, max: 39, name: "Solid", color: '#26a641' },           // Medium green
    { min: 40, max: 49, name: "Masterful", color: '#39d353' },       // Bright green
    { min: 50, max: Infinity, name: "God-Like", color: '#6bff82', isGodLike: true } // Glowing neon green
  ]
};

function getTierLevel(score) {
    if (score >= 50) return 5;
    if (score >= 40) return 4;
    if (score >= 30) return 3;
    if (score >= 20) return 2;
    return 1;
}

function initPBMode() {
  console.log("Daily PB Chaser Mode Activated 🏆");
  injectPBStyles();
  createPBTracker();
  loadAndResetPBIfNeeded();
  
  // Start the 3-day projection loop as a fallback
  setInterval(updateDailyProjections, 2000);

  // INSTANT UPDATE: Use MutationObserver to instantly detect when tasks are added/removed/edited 
  let debounceTimer;
  const observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      // Wait 300ms after DOM settles to run the scrape to avoid lag
      debounceTimer = setTimeout(updateDailyProjections, 300); 
  });
  
  // Start observing the whole body for UI changes
  observer.observe(document.body, { childList: true, subtree: true });
}

function injectPBStyles() {
  const style = document.createElement("style");
  style.id = "pb-styles";
  style.innerText = `
    .pb-tracker-container {
      position: fixed; top: 0; left: 50%; transform: translateX(-50%);
      width: 480px; background-color: #202124; color: white;
      border-radius: 0 0 12px 12px; z-index: 9999;
      box-shadow: 0 5px 20px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1);
      border-top: none; padding: 15px; font-family: 'Google Sans', Roboto, sans-serif;
      display: flex; flex-direction: column; gap: 8px; transition: all 0.3s ease;
    }
    .pb-tracker-header { display: flex; justify-content: space-between; align-items: flex-end; }
    .pb-score-wrapper { display: flex; align-items: center; gap: 8px; }
    .pb-score-area { font-size: 20px; font-weight: bold; color: #e8eaed; transition: color 0.3s, text-shadow 0.3s; }

    .god-like-text {
      color: #6bff82 !important; 
      text-shadow: 0 0 10px rgba(107, 255, 130, 0.4);
    }

    .pb-icon-btn {
      font-size: 14px; color: #9aa0a6; background: transparent;
      border: 1px solid #5f6368; border-radius: 4px; width: 24px; height: 24px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s; padding: 0;
    }
    .pb-icon-btn:hover { color: #e8eaed; border-color: #bdc1c6; background-color: rgba(255,255,255,0.1); transform: scale(1.05); }

    .pb-target-area { font-size: 13px; color: #bdc1c6; text-transform: uppercase; letter-spacing: 0.5px; transition: color 0.3s, text-shadow 0.3s; }
    
    .pb-bar-bg {
      width: 100%; height: 10px; background: #161b22; border-radius: 5px;
      overflow: hidden; position: relative; border: 1px solid #30363d;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
    }
    .pb-bar-fill {
      height: 100%; width: 0%; border-radius: 5px 0 0 5px; /* Square end on the right side */
      transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.6s ease, box-shadow 0.6s ease, border-radius 0.1s;
    }
    
    .god-like-bar { 
      box-shadow: 0 0 12px rgba(107, 255, 130, 0.8); 
    }

    /* Milestone Lines */
    .pb-milestone {
      position: absolute; top: 0; bottom: 0; width: 2px;
      background: rgba(255, 255, 255, 0.3); z-index: 10;
    }

    /* Calendar Grid Projected Points Badge - Absolute Positioned */
    .pb-day-badge {
      position: absolute;
      left: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(92, 146, 247, 0.15);
      color: #5c92f7;
      font-size: 11px;
      font-weight: bold;
      padding: 3px 6px;
      border-radius: 6px;
      white-space: nowrap;
      pointer-events: none;
      border: 1px solid rgba(92, 146, 247, 0.3);
      line-height: 1;
      font-family: 'Google Sans', sans-serif;
      z-index: 10;
    }
  `;
  document.head.appendChild(style);
}

function createPBTracker() {
  const container = document.createElement('div');
  container.className = 'pb-tracker-container';
  container.id = 'pb-ui-root';

  container.innerHTML = `
    <div class="pb-tracker-header">
      <div class="pb-score-wrapper">
        <div class="pb-score-area" id="pb-score">0 pts</div>
        <button class="pb-icon-btn" id="pb-stats" title="Statistics">📊</button>
        <button class="pb-icon-btn" id="pb-reset" title="Reset Daily">↺</button>
      </div>
      <div class="pb-target-area" id="pb-target">Pathetic</div>
    </div>
    <div class="pb-bar-bg">
        <div class="pb-bar-fill" id="pb-bar"></div>
        <div class="pb-milestone" style="left: 40%;" title="Underwhelming (20)"></div>
        <div class="pb-milestone" style="left: 60%;" title="Solid (30)"></div>
        <div class="pb-milestone" style="left: 80%;" title="Masterful (40)"></div>
    </div>
  `;

  document.body.appendChild(container);

  // Listeners
  document.getElementById('pb-stats').onclick = (e) => { e.stopPropagation(); window.open(chrome.runtime.getURL('statistics.html'), '_blank'); };
  document.getElementById('pb-reset').onclick = (e) => {
    e.stopPropagation();
    if(confirm("Reset daily points?")) {
      chrome.storage.sync.set({dailyScore: 0}, () => {
         updatePBUI(0);
      });
    }
  };
}

function updatePBUI(dailyScore) {
  CURRENT_DAILY_SCORE_MEM = dailyScore; // Update Memory for projections
  
  const scoreDisplay = document.getElementById('pb-score');
  const targetDisplay = document.getElementById('pb-target');
  const barFill = document.getElementById('pb-bar');
  if(!scoreDisplay) return;

  scoreDisplay.innerText = `${dailyScore} pts`;
  
  // Find Current Tier
  const currentTier = PB_CONFIG.TIERS.find(t => dailyScore >= t.min && dailyScore <= t.max);
  targetDisplay.innerText = currentTier.name;
  
  // Reset classes
  scoreDisplay.classList.remove('god-like-text');
  targetDisplay.classList.remove('god-like-text');
  barFill.classList.remove('god-like-bar');

  // Apply specific colors based on tier
  if (currentTier.isGodLike) {
      scoreDisplay.classList.add('god-like-text');
      targetDisplay.classList.add('god-like-text');
      barFill.classList.add('god-like-bar');
  } else if (dailyScore >= 30) {
      scoreDisplay.style.color = '#ffffff';
      targetDisplay.style.color = '#e8eaed';
  } else {
      scoreDisplay.style.color = '#e8eaed';
      targetDisplay.style.color = '#bdc1c6';
  }
  
  // Calculate Bar Width (Maxes out at 50)
  const percentage = Math.min((dailyScore / PB_CONFIG.MAX_BAR_SCORE) * 100, 100);
  barFill.style.width = `${percentage}%`;
  barFill.style.backgroundColor = currentTier.color;

  // Handle corner rounding: square until it reaches the end
  if (percentage >= 100) {
      barFill.style.borderRadius = '5px';
  } else {
      barFill.style.borderRadius = '5px 0 0 5px';
  }

  updateDailyProjections();
}

function loadAndResetPBIfNeeded() {
  chrome.storage.sync.get(['dailyScore', 'personalBest', 'monthlyPersonalBest', 'lastActiveDate', 'history'], (data) => {
    const now = new Date();
    if(now.getHours() < 3) now.setDate(now.getDate() - 1);
    const todayDate = now.toISOString().split('T')[0];
    const todayMonth = todayDate.substring(0, 7);

    let score = data.dailyScore || 0;
    let history = data.history || [];
    let monthly = data.monthlyPersonalBest || 15;

    // Daily Reset
    if(data.lastActiveDate !== todayDate) {
      if(!history.find(h => h.date === data.lastActiveDate)) {
        history.push({date: data.lastActiveDate, score: score});
      }
      score = 0;
    }
    // Monthly Reset
    if((data.lastActiveDate || "").substring(0, 7) !== todayMonth) {
      monthly = Math.max(score, 15);
    }

    chrome.storage.sync.set({
      dailyScore: score, 
      lastActiveDate: todayDate, 
      monthlyPersonalBest: monthly,
      history: history
    });
    updatePBUI(score);
  });
}

function handlePBTaskComplete(points) {
  chrome.storage.sync.get(['dailyScore', 'personalBest', 'monthlyPersonalBest'], (data) => {
    let score = (data.dailyScore || 0) + points;
    let allTime = data.personalBest || 5;
    let monthly = data.monthlyPersonalBest || 15;
    const oldScore = data.dailyScore || 0;

    // Save PBs silently
    if (score > allTime) allTime = score;
    if (score > monthly) monthly = score;

    // --- TIER & SOUND LOGIC ---
    const oldTier = getTierLevel(oldScore);
    const newTier = getTierLevel(score);

    if (newTier > oldTier && newTier > 1) {
        if (newTier === 5) playSound('major');
        else playSound('levelup');
        triggerConfetti();
    } else {
        playSound('success');
    }

    chrome.storage.sync.set({ dailyScore: score, personalBest: allTime, monthlyPersonalBest: monthly });
    updatePBUI(score);
  });
}

function updateDailyProjections() {
  if (CURRENT_MODE !== 'pb') return;

  const now = new Date();
  if (now.getHours() < 3) now.setDate(now.getDate() - 1); // 3AM Business Logic
  
  // Set up target arrays for Today, Tomorrow, and Day After Tomorrow
  const datesInfo = [0, 1, 2].map(offset => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    
    // Generate multiple text formats so we can robustly match against GCal's UI
    // GCal frequently drops the year (e.g. "Wednesday, March 18")
    const mLong = d.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
    const mShort = d.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
    const dayNum = d.getDate();
    const yearNum = d.getFullYear();
    const wLong = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    return {
      offset: offset,
      dateObj: d,
      matchStrings: [
          `${mLong} ${dayNum}, ${yearNum}`, // "march 18, 2026"
          `${mShort} ${dayNum}, ${yearNum}`, // "mar 18, 2026"
          `${mLong} ${dayNum}`, // "march 18"
          `${mShort} ${dayNum}`, // "mar 18"
          `${wLong}, ${mLong} ${dayNum}` // "wednesday, march 18"
      ],
      uncompletedPoints: 0,
      completedPoints: 0
    };
  });

  const seenTasks = new Set();
  const taskChips = document.querySelectorAll('[data-eventid^="tasks_"]');

  taskChips.forEach(chip => {
    const eventId = chip.getAttribute('data-eventid');
    if (seenTasks.has(eventId)) return;

    const hiddenSpan = chip.querySelector('.XuJrye');
    const hiddenText = hiddenSpan ? hiddenSpan.textContent.toLowerCase() : "";
    let targetDayInfo = null;

    // Check 1: Using the parent gridcell accessibility labels
    const gridcell = chip.closest('[role="gridcell"]');
    if (gridcell) {
      const labelId = gridcell.getAttribute('aria-labelledby');
      if (labelId) {
        const labelEl = document.getElementById(labelId);
        const labelText = labelEl ? labelEl.textContent.toLowerCase() : "";
        targetDayInfo = datesInfo.find(d => 
          d.matchStrings.some(str => labelText.includes(str)) || 
          (d.offset === 0 && labelText.includes('today')) ||
          (d.offset === 1 && labelText.includes('tomorrow'))
        );
      }
    }

    // Check 2: Using the task's own hidden text content
    if (!targetDayInfo && hiddenText) {
      targetDayInfo = datesInfo.find(d => 
        d.matchStrings.some(str => hiddenText.includes(str)) || 
        (d.offset === 0 && hiddenText.includes('today')) ||
        (d.offset === 1 && hiddenText.includes('tomorrow'))
      );
    }

    if (targetDayInfo) {
      seenTasks.add(eventId);

      let title = "";
      const titleSpan = chip.querySelector('.WBi6vc');
      if (titleSpan) title = titleSpan.textContent;
      else if (hiddenSpan) title = hiddenSpan.textContent;
      else title = chip.innerText;

      const points = extractPoints(title);

      const markCompleteBtn = chip.querySelector('button[aria-label="Mark complete"]');
      const markUncompletedBtn = chip.querySelector('button[aria-label="Mark uncompleted"]');
      
      let isCompleted = false;
      if (markUncompletedBtn) isCompleted = true;
      else if (markCompleteBtn) isCompleted = false;
      else if (hiddenText.includes('not completed')) isCompleted = false;
      else if (hiddenText.includes('completed')) isCompleted = true;
      else {
        const strike = chip.querySelector('span[style*="line-through"]');
        if (strike) isCompleted = true;
      }

      if (isCompleted) targetDayInfo.completedPoints += points;
      else targetDayInfo.uncompletedPoints += points;
    }
  });

  // Inject the calculated projections into the respective Calendar Headers
  datesInfo.forEach(dayInfo => {
    let projPts = dayInfo.uncompletedPoints;
    
    // Merge actual running score for Today
    if (dayInfo.offset === 0) {
      projPts += Math.max(CURRENT_DAILY_SCORE_MEM, dayInfo.completedPoints);
    } else {
      projPts += dayInfo.completedPoints;
    }

    let targetH2 = null;
    const headers = document.querySelectorAll('h2');
    
    // Find the header element that matches this specific day
    for (const h2 of headers) {
      const btn = h2.querySelector('button[data-datekey]');
      const ariaLabel = h2.getAttribute('aria-label') || (btn ? btn.getAttribute('aria-label') : '');
      if (!ariaLabel) continue;
      
      const labelLower = ariaLabel.toLowerCase();
      
      // Using our multi-format matcher to ensure it finds tomorrow and next day even without a year string
      if (dayInfo.matchStrings.some(str => labelLower.includes(str)) ||
          (dayInfo.offset === 0 && labelLower.includes('today')) ||
          (dayInfo.offset === 1 && labelLower.includes('tomorrow'))) {
        targetH2 = h2;
        break;
      }
    }

    // Embed the badge in the Calendar Grid
    if (targetH2) {
      let badge = targetH2.querySelector('.pb-day-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'pb-day-badge';
        
        // Ensure the H2 can contain absolute positioned elements
        targetH2.style.position = 'relative';
        targetH2.appendChild(badge);
      }
      badge.innerText = `Proj: ${projPts}`;
    }
  });
}

// ==========================================
//           SYSTEM 2: RPG LEVEL UP
// ==========================================

const RPG_CONFIG = {
  XP_PER_TASK: 20, // Default fixed XP
  BASE_XP: 300,
  GRADIENTS: [
    'linear-gradient(90deg, #FF512F, #DD2476)', // 1-4 Red
    'linear-gradient(90deg, #8E2DE2, #4A00E0)', // 5-9 Purple
    'linear-gradient(90deg, #e65c00, #F9D423)', // 10-14 Orange
    'linear-gradient(90deg, #11998e, #38ef7d)', // 15-19 Teal
    'linear-gradient(90deg, #FC466B, #3F5EFB)', // 20-24 Pink/Blue
    'linear-gradient(90deg, #00d2ff, #3a7bd5)', // 25-29 Cyan
    'linear-gradient(90deg, #f2709c, #ff9472)', // 30-34 Coral
    'linear-gradient(90deg, #c31432, #240b36)', // 35-39 Dark Red
    'linear-gradient(90deg, #FFD700, #FDB931)', // 40-44 Gold
    'linear-gradient(90deg, #E0E0E0, #BDBDBD)', // 45-49 Silver
    'linear-gradient(90deg, #B24592, #F15F79)', // 50-54 Grapefruit
    'linear-gradient(90deg, #00F260, #0575E6)', // 55-59 Emerald
  ]
};

function initRPGMode() {
  console.log("RPG Mode Activated ⚔️");
  injectRPGStyles();
  createRPGTracker();
  loadRPGData();
}

function injectRPGStyles() {
  const style = document.createElement("style");
  style.id = "rpg-styles";
  style.innerText = `
    .rpg-tracker {
      position: fixed; top: 0; left: 50%; transform: translateX(-50%);
      width: 400px; background-color: #202124; color: white;
      border-radius: 0 0 12px 12px; z-index: 9999;
      box-shadow: 0 5px 15px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);
      border-top: none; padding: 12px; font-family: 'Google Sans', sans-serif;
      display: flex; flex-direction: column; gap: 6px;
    }
    .rpg-text { display: flex; justify-content: space-between; align-items: baseline; }
    .rpg-level { font-weight: bold; font-size: 18px; color: #e8eaed; }
    .rpg-xp { font-size: 12px; color: #bdc1c6; }
    .rpg-bar-bg { width: 100%; height: 12px; background: #5f6368; border-radius: 6px; overflow: hidden; }
    .rpg-bar-fill { height: 100%; width: 0%; border-radius: 6px; transition: width 0.5s ease, background 0.5s ease; }
    @keyframes rpgFlash { 0% { box-shadow: 0 0 0 0 rgba(255,215,0,0.9); } 100% { box-shadow: 0 0 20px 0 rgba(255,215,0,0); } }
    .level-up-flash { animation: rpgFlash 0.8s ease-out; }
  `;
  document.head.appendChild(style);
}

function createRPGTracker() {
  const div = document.createElement('div');
  div.className = 'rpg-tracker';
  div.id = 'rpg-ui-root';
  div.innerHTML = `
    <div class="rpg-text">
      <div class="rpg-level" id="rpg-level-txt">Level 1</div>
      <div class="rpg-xp" id="rpg-xp-txt">0 / 300 XP</div>
    </div>
    <div class="rpg-bar-bg"><div class="rpg-bar-fill" id="rpg-bar"></div></div>
  `;
  document.body.appendChild(div);
}

function updateRPGUI(level, xp) {
  const lvlTxt = document.getElementById('rpg-level-txt');
  const xpTxt = document.getElementById('rpg-xp-txt');
  const bar = document.getElementById('rpg-bar');
  if(!lvlTxt) return;

  const target = RPG_CONFIG.BASE_XP;
  lvlTxt.innerText = `Level ${level}`;
  xpTxt.innerText = `${xp} / ${target} XP`;
  
  const pct = (xp / target) * 100;
  bar.style.width = `${pct}%`;
  
  // Color
  const tier = Math.floor((level - 1) / 5);
  bar.style.background = RPG_CONFIG.GRADIENTS[tier % RPG_CONFIG.GRADIENTS.length];
}

function loadRPGData() {
  chrome.storage.sync.get(['rpgLevel', 'rpgXP'], (data) => {
    updateRPGUI(data.rpgLevel || 1, data.rpgXP || 0);
  });
}

function handleRPGTaskComplete(points) {
  // RPG uses fixed 20xp per task usually, but we can add 'points' bonus if exists
  // For simplicity, let's use fixed 20 + points
  const xpGain = RPG_CONFIG.XP_PER_TASK + (points > 1 ? points * 5 : 0);

  chrome.storage.sync.get(['rpgLevel', 'rpgXP'], (data) => {
    let level = data.rpgLevel || 1;
    let xp = (data.rpgXP || 0) + xpGain;
    const target = RPG_CONFIG.BASE_XP;
    let leveledUp = false;

    while(xp >= target) {
      level++;
      xp -= target;
      leveledUp = true;
    }

    if(leveledUp) {
      playSound('major');
      triggerConfetti();
      const ui = document.getElementById('rpg-ui-root');
      if(ui) {
        ui.classList.add('level-up-flash');
        setTimeout(() => ui.classList.remove('level-up-flash'), 800);
      }
    } else {
      playSound('success'); // Replaced empty sound call with basic click logic
    }

    chrome.storage.sync.set({ rpgLevel: level, rpgXP: xp });
    updateRPGUI(level, xp);
  });
}

// ==========================================
//           MAIN CONTROLLER
// ==========================================

function extractPoints(text) {
  if (!text) return 1;
  let match = text.match(/\{(\d+)\}(?=\s*(\n|$))/);
  if (!match) {
    const all = [...text.matchAll(/\{(\d+)\}/g)];
    if(all.length > 0) match = all[all.length-1];
  }
  return (match && match[1]) ? parseInt(match[1], 10) : 1;
}

// Global Click Listener
document.body.addEventListener('click', function(event) {
  const target = event.target;
  const isCheckbox = target.closest('[role="checkbox"]');
  const isListBtn = target.closest('button[data-completed="false"]');
  const isDetailBtn = target.closest('button[aria-label="Mark complete"]');
  const isTextMatch = target.closest('button') && target.closest('button').innerText.includes("Mark completed");

  const element = isListBtn || isCheckbox || isDetailBtn || (isTextMatch ? target.closest('button') : null);
  if (!element) return;

  // Find Title
  let title = "";
  let source = element.closest('[data-taskid]') || element.closest('[role="listitem"]') || element.closest('.kma42e');
  
  if(!source) {
    let candidate = element.parentElement;
    for(let i=0; i<4; i++) {
      if(candidate && candidate.innerText && candidate.innerText.length > 3) { source = candidate; break; }
      if(candidate) candidate = candidate.parentElement;
    }
  }

  if(source) {
    const h = source.querySelector('[role="heading"]');
    title = h ? h.innerText : source.innerText;
  }

  const points = extractPoints(title);
  console.log(`Task done. Mode: ${CURRENT_MODE}. Points: ${points}`);

  if (CURRENT_MODE === 'pb') {
    handlePBTaskComplete(points);
  } else {
    handleRPGTaskComplete(points);
  }
}, true);

// Init
chrome.storage.sync.get(['extensionMode'], (data) => {
  CURRENT_MODE = data.extensionMode || 'pb';
  if (CURRENT_MODE === 'pb') initPBMode();
  else initRPGMode();
});