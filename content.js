console.log("Calendar Celebration Extension Loaded! 🎉");

function celebrate() {
  // Play the sound
  const soundUrl = chrome.runtime.getURL('assets/success.mp3');
  const audio = new Audio(soundUrl);
  audio.play().catch(e => console.error("Error playing sound:", e));

  // Launch confetti
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      zIndex: 9999
    });
  } else {
    console.error("Confetti library is not loaded.");
  }
}

// Listen for all clicks on the page
document.body.addEventListener('click', function(event) {
  // Find the closest parent button to what was clicked
  const button = event.target.closest('button');

  // If no button was found, do nothing
  if (!button) {
    return;
  }

  // Check if the button has the specific attribute data-completed="false".
  // This identifies the button by its function, not its appearance.
  if (button.getAttribute('data-completed') === 'false') {
    console.log("Completion button found! Celebrating...");
    setTimeout(celebrate, 100);
  }
});