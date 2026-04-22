(() => {
console.log("Work Time Converter Loaded ⏰");

// Convert points to time (every point = 10 mins)
function convertPointsToTime(points) {
  const totalMinutes = points * 10;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

// Scan and update all tasks
function updateAllTasks() {
  // Look for all .WBi6vc spans that contain task text
  document.querySelectorAll('.WBi6vc').forEach(titleSpan => {
    const text = titleSpan.textContent;
    
    // Check if contains "work"
    if (!text.toLowerCase().includes('work')) return;

    // Look for {number} pattern
    const match = text.match(/\{(\d+)\}/);
    if (!match) return;

    const points = parseInt(match[1], 10);
    const time = convertPointsToTime(points);

    // Check if already has time
    if (titleSpan.querySelector('.work-time')) return;

    // Create time span
    const timeSpan = document.createElement('span');
    timeSpan.className = 'work-time';
    timeSpan.textContent = ` (${time})`;
    Object.assign(timeSpan.style, {
      marginLeft: '4px',
      opacity: '0.8',
      fontSize: '0.9em'
    });

    // Add after the text
    titleSpan.appendChild(timeSpan);
    console.log(`✓ Work task: "${text}" = ${time}`);
  });
}

// Run immediately
updateAllTasks();

// Run again after delay
setTimeout(updateAllTasks, 500);
setTimeout(updateAllTasks, 2000);

// Watch for new tasks
const observer = new MutationObserver(() => {
  updateAllTasks();
});

observer.observe(document.body, { 
  childList: true, 
  subtree: true
});

console.log("✓ Work time converter active");
})();
