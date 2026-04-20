document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('sky-canvas');
  const ctx = canvas.getContext('2d');
  const monthSelect = document.getElementById('month-select');
  const uiBox = document.getElementById('ui');

  let width, height;
  let zoom = 1;
  let offsetX = 0;
  let offsetY = 0;

  let currentStars = [];
  let pomodoroHistory = {};
  
  const date = new Date();
  let currentKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

  function getCurrentStars() {
    let stars = pomodoroHistory[currentKey] || [];
    if (typeof stars === 'number') {
      stars = Array(stars).fill(25 * 60);
    }
    return stars;
  }

  function resize() {
    width = window.innerWidth / 4;
    height = window.innerHeight / 4;
    canvas.width = width;
    canvas.height = height;
    
    drawSky();
  }

  window.addEventListener('resize', resize);

  chrome.storage.local.get(['pomodoroHistory'], (result) => {
    pomodoroHistory = result.pomodoroHistory || {};
    if (!pomodoroHistory[currentKey]) {
      pomodoroHistory[currentKey] = [];
    }
    populateSelect();
    monthSelect.value = currentKey;
    currentStars = getCurrentStars();
    resize(); // Will call drawSky
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.pomodoroHistory) {
      pomodoroHistory = changes.pomodoroHistory.newValue || {};
      if (!pomodoroHistory[currentKey]) {
        pomodoroHistory[currentKey] = [];
      }
      populateSelect();
      if (monthSelect.querySelector(`option[value="${currentKey}"]`)) {
          monthSelect.value = currentKey;
      }
      currentStars = getCurrentStars();
      drawSky();
    }
  });

  monthSelect.addEventListener('change', (e) => {
    currentKey = e.target.value;
    currentStars = getCurrentStars();
    drawSky();
  });

  function populateSelect() {
    monthSelect.innerHTML = '';
    const keys = Object.keys(pomodoroHistory).sort().reverse(); // newest first
    for (const key of keys) {
      const option = document.createElement('option');
      option.value = key;
      // format key "YYYY-MM"
      const [y, m] = key.split('-');
      const dateObj = new Date(parseInt(y), parseInt(m) - 1, 1);
      const monthName = dateObj.toLocaleString('default', { month: 'long' });
      option.textContent = `${monthName} ${y}`;
      monthSelect.appendChild(option);
    }
  }

  function drawSky() {
    // Background
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, width, height);
    
    ctx.save();
    
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(offsetX, offsetY);

    let seed = 12345;
    function random() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }

    const uiRect = uiBox.getBoundingClientRect();
    const uiLeft = (uiRect.left - window.innerWidth / 2) / 4;
    const uiRight = (uiRect.right - window.innerWidth / 2) / 4;
    const uiTop = (uiRect.top - window.innerHeight / 2) / 4;
    const uiBottom = (uiRect.bottom - window.innerHeight / 2) / 4;

    function isInsideUI(x, y) {
      return x >= uiLeft - 5 && x <= uiRight + 5 && y >= uiTop - 5 && y <= uiBottom + 5;
    }

    let starsDrawn = 0;
    let i = 0;

    // Use while loop to ensure we draw exactly starCount stars that are outside UI
    while (starsDrawn < starCount && i < 100000) {
      const angle = i * 2.39996 + (random() * 0.5 - 0.25);
      const radius = Math.sqrt(i) * 15 + (random() * 10 - 5);
      
      const x = Math.floor(Math.cos(angle) * radius);
      const y = Math.floor(Math.sin(angle) * radius);
      
      const type = random();
      i++;

      if (isInsideUI(x, y)) {
        continue;
      }
      
      starsDrawn++;

      // Normal detail
      if (type > 0.95) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(x, y, 2, 2);
      } else if (type > 0.8) {
        ctx.fillStyle = '#ccc';
        ctx.fillRect(x, y, 1, 1);
      } else if (type > 0.6) {
        ctx.fillStyle = '#ffc';
        ctx.fillRect(x, y, 1, 1);
      } else if (type > 0.5) {
         ctx.fillStyle = '#cff';
         ctx.fillRect(x, y, 1, 1);
      } else {
        ctx.fillStyle = '#fff';
        ctx.fillRect(x, y, 1, 1);
      }
    }
    
    ctx.restore();
  }
});