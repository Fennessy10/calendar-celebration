document.addEventListener('DOMContentLoaded', () => {
  const btnPb = document.getElementById('btn-pb');
  const btnRpg = document.getElementById('btn-rpg');

  if (!btnPb || !btnRpg) {
    console.error("Buttons not found in popup.html");
    return;
  }

  // 1. Load saved setting on startup
  chrome.storage.sync.get(['extensionMode'], (data) => {
    const mode = data.extensionMode || 'pb'; // Default to PB
    updateVisuals(mode);
  });

  // 2. Click Handlers
  btnPb.addEventListener('click', () => handleSelection('pb'));
  btnRpg.addEventListener('click', () => handleSelection('rpg'));

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
    } else {
      btnRpg.classList.add('active', 'rpg');
      btnPb.classList.remove('active');
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
          // Optional: Close popup after selection
          // window.close(); 
      } else {
          console.log("Not on Google Calendar, skipped reload.");
      }
    });
  }
});