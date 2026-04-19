document.addEventListener('DOMContentLoaded', () => {
  const btnPb = document.getElementById('btn-pb');
  const btnRpg = document.getElementById('btn-rpg');
  const btnSound = document.getElementById('btn-sound');
  const btnPomodoro = document.getElementById('btn-pomodoro');
  const pbSettings = document.getElementById('pb-settings');
  const tierSelect = document.getElementById('pb-tier-select');

  if (!btnPb || !btnRpg || !btnSound || !btnPomodoro) {
    console.error("Buttons not found in popup.html");
    return;
  }

  // 1. Load saved settings on startup
  chrome.storage.sync.get(['extensionMode', 'pbTierCount'], (data) => {
    const mode = data.extensionMode || 'pb'; // Default to PB
    tierSelect.value = data.pbTierCount || 7; // Default to 7 Tiers
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
    } else if (mode === 'rpg') {
      btnRpg.classList.add('active', 'rpg');
      btnPb.classList.remove('active');
      btnSound.classList.remove('active', 'sound');
      btnPomodoro.classList.remove('active', 'pomodoro');
      pbSettings.style.display = 'none'; // Hide PB Settings
    } else if (mode === 'sound') {
      btnSound.classList.add('active', 'sound');
      btnPb.classList.remove('active');
      btnRpg.classList.remove('active', 'rpg');
      btnPomodoro.classList.remove('active', 'pomodoro');
      pbSettings.style.display = 'none'; // Hide PB Settings
    } else if (mode === 'pomodoro') {
      btnPomodoro.classList.add('active', 'pomodoro');
      btnPb.classList.remove('active');
      btnRpg.classList.remove('active', 'rpg');
      btnSound.classList.remove('active', 'sound');
      pbSettings.style.display = 'none'; // Hide PB Settings
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