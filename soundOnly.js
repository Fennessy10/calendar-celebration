// Wrapped in a check so it only runs if Sound Only mode is active
chrome.storage.sync.get(['extensionMode'], (result) => {
  if (result.extensionMode === 'sound') {
    
    console.log("Sound Only Mode Activated 🔊");

    // --- SOUND LOGIC ---
    const SOUND_VOLUME = 0.1;

    // Modified to accept a boolean determining if the major sound should play
    function playTaskCompleteSound(isMajor) {
      const file = isMajor ? 'assets/10-levels.mp3' : 'assets/plinker.mp3';
      const soundUrl = chrome.runtime.getURL(file);
      const audio = new Audio(soundUrl);
      audio.volume = SOUND_VOLUME;
      audio.play().catch(e => console.error("Error playing task sound:", e));
    }

    // --- CONFETTI LOGIC ---
    function triggerConfetti() {
      if (typeof window.confetti === 'function') {
        window.confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, zIndex: 10000 });
      } else if (typeof confetti === 'function') {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, zIndex: 10000 });
      }
    }

    // --- MAIN LOGIC ---
    // Added `true` for event capturing like in point.js to ensure it fires reliably
    document.body.addEventListener('click', function(event) {
      // 1. Check for the original sidebar task list button
      const listButton = event.target.closest('button[data-completed="false"]');
      
      // 2. Check for the detailed view "Mark complete" button
      const detailButton = event.target.closest('button[aria-label="Mark complete"]');
      
      const element = listButton || detailButton;
      
      // If neither was clicked, stop the function
      if (!element) return;

      // 3. Extract the title (Reusing the robust logic from point.js)
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

      // Clean the string and check if the first letter is Z (case-insensitive)
      const cleanTitle = title.trim();
      const startsWithZ = cleanTitle.toLowerCase().startsWith('z');

      // Just play the sound, no tracking
      playTaskCompleteSound(startsWithZ);

      // Trigger confetti if it starts with Z
      if (startsWithZ) {
        triggerConfetti();
      }

    }, true); 

  } // End of Sound Only mode check
});