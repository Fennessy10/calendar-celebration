console.log("Trello Zelda Sound Extension Loaded! 🗡️");

const SOUND_VOLUME = 0.2;

function playZeldaSound() {
  const soundUrl = chrome.runtime.getURL('assets/zelda_sound.mp3');
  const audio = new Audio(soundUrl);
  audio.volume = SOUND_VOLUME;
  audio.play().catch(e => console.log("Audio play failed:", e));
}

// Listen for clicks across the entire document
document.body.addEventListener('click', function(event) {
  const target = event.target;

  // 1. Strict Semantic Check
  // We look specifically for actual checkbox roles or Trello's testing IDs to avoid greedy matching on outer popups
  const checkbox = target.closest('[role="checkbox"], [data-testid="check-item-toggle"]');
  
  if (checkbox && checkbox.hasAttribute('aria-checked')) {
    // If it is currently 'false', the user is clicking an empty checkbox to COMPLETE the task.
    if (checkbox.getAttribute('aria-checked') === 'false') {
      playZeldaSound();
    }
    // We found the actual semantic checkbox, so we stop here
    return; 
  }

  // 2. Visual SVG Check (Bulletproof Fallback)
  // If the semantic checkbox wasn't found, check if they clicked the specific "empty circle" icon.
  let clickedPath = null;
  
  if (target.tagName.toLowerCase() === 'path') {
    clickedPath = target;
  } else {
    // If they clicked the wrapper, find the path inside it
    const wrapper = target.closest('svg, span');
    if (wrapper) {
      clickedPath = wrapper.querySelector('path');
    }
  }

  if (clickedPath) {
    const d = clickedPath.getAttribute('d');
    
    // The exact path you provided for an UNCOMPLETED circle starts with "M8 1.5"
    // When a task is already completed, Trello swaps the SVG to a checkmark path, so this won't match.
    if (d && d.startsWith('M8 1.5')) {
      playZeldaSound();
    }
  }
  
}, true); // Use capture phase (true) to ensure we catch the click before Trello updates the DOM