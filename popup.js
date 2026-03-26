document.addEventListener('DOMContentLoaded', () => {
  const btnPb = document.getElementById('btn-pb');
  const btnRpg = document.getElementById('btn-rpg');
  const pbSettings = document.getElementById('pb-settings');
  const tierSelect = document.getElementById('pb-tier-select');

  if (!btnPb || !btnRpg) {
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
      pbSettings.style.display = 'block'; // Show PB Settings
    } else {
      btnRpg.classList.add('active', 'rpg');
      btnPb.classList.remove('active');
      pbSettings.style.display = 'none'; // Hide PB Settings
    }
  }

  function reloadCalendarTab() {
    // We query tabs safely
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (chrome.runtime.lastError) {
        console.log("Tab query error:", chrome.runtime.lastError);
        return;
      }
      
      const activeTab = tabs[0];
      
      // Check if tab exists and if it is Google Calendar
      if (activeTab && activeTab.url && activeTab.url.includes("calendar.google.com")) {
          chrome.tabs.reload(activeTab.id);
      } else {
          console.log("Not on Google Calendar, skipped reload.");
      }
    });
  }
});