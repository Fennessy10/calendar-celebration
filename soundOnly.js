// Wrapped in a check so it only runs if Sound Only mode is active
chrome.storage.sync.get(['extensionMode'], (result) => {
  if (result.extensionMode === 'sound') {
    
    console.log("Sound Only Mode Activated 🔊");

    // --- SOUND LOGIC ---
    const SOUND_VOLUME = 0.1;

    function playTaskCompleteSound() {
      const soundUrl = chrome.runtime.getURL('assets/plinker.mp3');
      const audio = new Audio(soundUrl);
      audio.volume = SOUND_VOLUME;
      audio.play().catch(e => console.error("Error playing task sound:", e));
    }

    // --- MAIN LOGIC ---
    document.body.addEventListener('click', function(event) {
      // 1. Check for the original sidebar task list button
      const listButton = event.target.closest('button[data-completed="false"]');
      
      // 2. Check for the detailed view "Mark complete" button
      const detailButton = event.target.closest('button[aria-label="Mark complete"]');
      
      // If neither was clicked, stop the function
      if (!listButton && !detailButton) return;

      // Just play the sound, no tracking
      playTaskCompleteSound();
    });

  } // End of Sound Only mode check
});
