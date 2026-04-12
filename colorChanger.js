console.log("Color Changer Loaded 🎨");

// Color palette options
const COLOR_PALETTE = [
  { name: 'Red', border: 'rgb(217, 48, 37)', bg: 'rgb(230, 124, 115)', chip: 'rgb(198, 89, 17)' },
  { name: 'Orange', border: 'rgb(230, 124, 19)', bg: 'rgb(255, 158, 101)', chip: 'rgb(239, 108, 0)' },
  { name: 'Yellow', border: 'rgb(249, 168, 37)', bg: 'rgb(255, 209, 0)', chip: 'rgb(249, 168, 37)' },
  { name: 'Green', border: 'rgb(51, 182, 121)', bg: 'rgb(86, 207, 148)', chip: 'rgb(0, 150, 136)' },
  { name: 'Cyan', border: 'rgb(0, 188, 212)', bg: 'rgb(179, 229, 252)', chip: 'rgb(0, 172, 193)' },
  { name: 'Blue', border: 'rgb(57, 73, 171)', bg: 'rgb(197, 202, 233)', chip: 'rgb(63, 81, 181)' },
  { name: 'Purple', border: 'rgb(142, 36, 170)', bg: 'rgb(206, 147, 216)', chip: 'rgb(123, 31, 162)' },
  { name: 'Pink', border: 'rgb(236, 64, 122)', bg: 'rgb(248, 187, 208)', chip: 'rgb(194, 24, 91)' },
  { name: 'Gray', border: 'rgb(158, 158, 158)', bg: 'rgb(189, 189, 189)', chip: 'rgb(117, 117, 117)' },
  { name: 'Brown', border: 'rgb(121, 85, 72)', bg: 'rgb(177, 133, 112)', chip: 'rgb(62, 39, 35)' },
];

// Create color picker popup
function createColorPicker(task, x, y) {
  // Remove existing picker if any
  const existingPicker = document.getElementById('task-color-picker');
  if (existingPicker) existingPicker.remove();

  const picker = document.createElement('div');
  picker.id = 'task-color-picker';
  Object.assign(picker.style, {
    position: 'fixed',
    top: y + 'px',
    left: x + 'px',
    background: '#202124',
    border: '1px solid #5f6368',
    borderRadius: '8px',
    padding: '12px',
    zIndex: '10001',
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
  });

  COLOR_PALETTE.forEach(color => {
    const colorBtn = document.createElement('button');
    colorBtn.title = color.name;
    Object.assign(colorBtn.style, {
      width: '32px',
      height: '32px',
      borderRadius: '4px',
      background: color.bg,
      border: '2px solid ' + color.border,
      cursor: 'pointer',
      transition: 'transform 0.2s'
    });

    colorBtn.addEventListener('mouseenter', () => {
      colorBtn.style.transform = 'scale(1.15)';
    });
    colorBtn.addEventListener('mouseleave', () => {
      colorBtn.style.transform = 'scale(1)';
    });

    colorBtn.addEventListener('click', () => {
      changeTaskColor(task, color);
      picker.remove();
    });

    picker.appendChild(colorBtn);
  });

  document.body.appendChild(picker);

  // Close picker on outside click
  const closeHandler = (e) => {
    if (e.target !== picker && !picker.contains(e.target)) {
      picker.remove();
      document.removeEventListener('click', closeHandler);
    }
  };
  setTimeout(() => document.addEventListener('click', closeHandler), 0);
}

// Change task color
function changeTaskColor(task, color) {
  const borderDiv = task.querySelector('[style*="border-color"]');
  const bgDiv = task.querySelector('.pmUZFe');
  const chipDiv = task.querySelector('.KF4T6b');

  if (borderDiv) {
    borderDiv.style.borderColor = color.border;
  }
  if (bgDiv) {
    bgDiv.style.backgroundColor = color.bg;
  }
  if (chipDiv) {
    chipDiv.style.backgroundColor = color.chip;
  }

  console.log('Task color changed to', color.name);
}

// Right-click handler for task colors
document.body.addEventListener('contextmenu', (e) => {
  const task = e.target.closest('[data-eventchip][data-eventid]');
  
  if (task) {
    e.preventDefault();
    createColorPicker(task, e.clientX, e.clientY);
  }
}, true);

// Also allow left-click with modifier key (Ctrl/Cmd + Shift)
document.body.addEventListener('click', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
    const task = e.target.closest('[data-eventchip][data-eventid]');
    if (task) {
      e.preventDefault();
      e.stopPropagation();
      createColorPicker(task, e.clientX, e.clientY);
    }
  }
}, true);
