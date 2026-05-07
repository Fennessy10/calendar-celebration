document.addEventListener('DOMContentLoaded', () => {
  const btnPb = document.getElementById('btn-pb');
  const btnRpg = document.getElementById('btn-rpg');
  const btnSound = document.getElementById('btn-sound');
  const btnPomodoro = document.getElementById('btn-pomodoro');
  const pbSettings = document.getElementById('pb-settings');
  const globalSettings = document.getElementById('global-settings');
  const tierSelect = document.getElementById('pb-tier-select');
  const colorSelect = document.getElementById('pb-color-select');
  const customColorWrapper = document.getElementById('custom-color-wrapper');
  const customColorInput = document.getElementById('pb-custom-color');
  const defaultPointsInput = document.getElementById('default-points-input');
  const toggleFocusDay = document.getElementById('toggle-focus-day');

  if (!btnPb || !btnRpg || !btnSound || !btnPomodoro) {
    console.error("Buttons not found in popup.html");
    return;
  }

  // 1. Load saved settings on startup
  chrome.storage.sync.get(['extensionMode', 'pbTierCount', 'pbColorTheme', 'pbCustomColorHex', 'focusDayEnabled', 'defaultPoints'], (data) => {
    const mode = data.extensionMode || 'pb';
    tierSelect.value = data.pbTierCount || 7;
    colorSelect.value = data.pbColorTheme || 'green';
    customColorInput.value = data.pbCustomColorHex || '#a855f7';
    toggleFocusDay.checked = data.focusDayEnabled !== false;
    defaultPointsInput.value = data.defaultPoints || 2;
    
    if (colorSelect.value === 'custom') {
      customColorWrapper.style.display = 'flex';
    }
    
    updateVisuals(mode);
  });

  // 2. Click Handlers for Modes
  btnPb.addEventListener('click', () => handleSelection('pb'));
  btnRpg.addEventListener('click', () => handleSelection('rpg'));
  btnSound.addEventListener('click', () => handleSelection('sound'));
  btnPomodoro.addEventListener('click', () => handleSelection('pomodoro'));

  // 3. Change Handler for Tiers
  tierSelect.addEventListener('change', (e) => {
    const newCount = parseInt(e.target.value, 10);
    chrome.storage.sync.set({ pbTierCount: newCount }, () => {
      reloadCalendarTab();
    });
  });

  // 3b. Change Handler for Color Theme
  colorSelect.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
      customColorWrapper.style.display = 'flex';
    } else {
      customColorWrapper.style.display = 'none';
    }
    chrome.storage.sync.set({ pbColorTheme: e.target.value }, () => {
      reloadCalendarTab();
    });
  });

  // 3c. Change Handler for Custom Hex Input
  customColorInput.addEventListener('change', (e) => {
    chrome.storage.sync.set({ pbCustomColorHex: e.target.value }, () => {
      reloadCalendarTab();
    });
  });

  // 4. Change Handler for Focus Day View Toggle
  toggleFocusDay.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    chrome.storage.sync.set({ focusDayEnabled: isEnabled }, () => {
      console.log(`Focus Day View enabled: ${isEnabled}`);
    });
  });

  // 5. Change Handler for Default Points Input
  defaultPointsInput.addEventListener('change', (e) => {
    let points = parseInt(e.target.value, 10);
    if (isNaN(points) || points < 1) {
      points = 2; // Fallback to safe minimum
      e.target.value = 2;
    }
    chrome.storage.sync.set({ defaultPoints: points }, () => {
      reloadCalendarTab();
    });
  });

  function handleSelection(mode) {
    // Update UI immediately for responsiveness
    updateVisuals(mode);
    
    // Save to storage
    chrome.storage.sync.set({ extensionMode: mode }, () => {
      console.log(`Mode saved: ${mode}`);
      // Try to reload the calendar tab if active
      reloadCalendarTab();
    });
  }

  function updateVisuals(mode) {
    if (mode === 'pb') {
      btnPb.classList.add('active');
      btnRpg.classList.remove('active', 'rpg');
      btnSound.classList.remove('active', 'sound');
      btnPomodoro.classList.remove('active', 'pomodoro');
      pbSettings.style.display = 'block'; // Show PB Settings
      globalSettings.style.display = 'block'; // Show general point settings
    } else if (mode === 'rpg') {
      btnRpg.classList.add('active', 'rpg');
      btnPb.classList.remove('active');
      btnSound.classList.remove('active', 'sound');
      btnPomodoro.classList.remove('active', 'pomodoro');
      pbSettings.style.display = 'none'; // Hide PB Settings
      globalSettings.style.display = 'block'; // Show general point settings for RPG
    } else if (mode === 'sound') {
      btnSound.classList.add('active', 'sound');
      btnPb.classList.remove('active');
      btnRpg.classList.remove('active', 'rpg');
      btnPomodoro.classList.remove('active', 'pomodoro');
      pbSettings.style.display = 'none'; // Hide PB Settings
      globalSettings.style.display = 'none'; // Hide general point settings
    } else if (mode === 'pomodoro') {
      btnPomodoro.classList.add('active', 'pomodoro');
      btnPb.classList.remove('active');
      btnRpg.classList.remove('active', 'rpg');
      btnSound.classList.remove('active', 'sound');
      pbSettings.style.display = 'none'; // Hide PB Settings
      globalSettings.style.display = 'none'; // Hide general point settings
    }
  }

  function reloadCalendarTab() {
    // Query all tabs to find a calendar tab, regardless of which window is active
    chrome.tabs.query({}, function(tabs) {
      if (chrome.runtime.lastError) {
        console.log("Tab query error:", chrome.runtime.lastError);
        return;
      }
      
      // Find the first calendar tab
      const calendarTab = tabs.find(tab => tab.url && tab.url.includes("calendar.google.com"));
      
      if (calendarTab) {
        chrome.tabs.reload(calendarTab.id);
        console.log("Reloaded calendar tab");
      } else {
        console.log("No active calendar tab found to reload.");
      }
    });
  }
});