let globalGraphData = [];
let calendarDate = new Date();

// Helper to get local date string matching our extension logic
function getLocalBusinessDateString(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Centralized rank calculation (Shared by Calendar and Averages)
function getTierInfo(score) {
    if (score >= 50) return { class: 'tier-god', name: 'God-Like' };
    if (score >= 40) return { class: 'tier-masterful', name: 'Masterful' };
    if (score >= 30) return { class: 'tier-solid', name: 'Solid' };
    if (score >= 20) return { class: 'tier-underwhelming', name: 'Underwhelming' };
    return { class: 'tier-pathetic', name: 'Pathetic' };
}

// Calculate averages based on date ranges and update UI
function calculateAverages(data) {
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    
    let stats = {
        week: { total: 0, count: 0 },
        month: { total: 0, count: 0 }
    };

    data.forEach(point => {
        const diffDays = (now - point.rawDate) / msPerDay;
        
        if (diffDays <= 7) {
            stats.week.total += point.score;
            stats.week.count++;
        }
        if (diffDays <= 30) {
            stats.month.total += point.score;
            stats.month.count++;
        }
    });

    const avgWeek = stats.week.count > 0 ? (stats.week.total / stats.week.count) : 0;
    const avgMonth = stats.month.count > 0 ? (stats.month.total / stats.month.count) : 0;

    updateAverageCard('cardAvgWeek', 'avgWeek', 'tierAvgWeek', avgWeek);
    updateAverageCard('cardAvgMonth', 'avgMonth', 'tierAvgMonth', avgMonth);
}

function updateAverageCard(cardId, valId, tierId, score) {
    const card = document.getElementById(cardId);
    const valEl = document.getElementById(valId);
    const tierEl = document.getElementById(tierId);
    
    const tierInfo = getTierInfo(score);
    
    valEl.innerText = score.toFixed(1);
    tierEl.innerText = tierInfo.name;
    
    // Apply the tier class to the card dynamically
    card.className = 'stat-card ' + tierInfo.class;
}

document.addEventListener('DOMContentLoaded', () => {
    // Set date
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Load Data
    chrome.storage.sync.get(['dailyScore', 'personalBest', 'history', 'lastActiveDate'], (data) => {
        const history = data.history || [];
        const dailyScore = data.dailyScore || 0;
        const lastDate = data.lastActiveDate;

        // Populate Main Cards
        document.getElementById('allTimePB').innerText = data.personalBest || 0;
        document.getElementById('currentScore').innerText = dailyScore;
        document.getElementById('totalDays').innerText = history.length + (dailyScore > 0 ? 1 : 0);

        // Prepare Graph Data
        globalGraphData = [...history];
        
        // Add today if it's not already in history
        if (globalGraphData.length === 0 || globalGraphData[globalGraphData.length - 1].date !== lastDate) {
             if (dailyScore > 0) {
                 globalGraphData.push({ 
                     date: 'Today', 
                     score: dailyScore, 
                     rawDate: new Date() 
                });
             }
        } else {
            globalGraphData[globalGraphData.length - 1].score = dailyScore;
            globalGraphData[globalGraphData.length - 1].date = 'Today';
            globalGraphData[globalGraphData.length - 1].rawDate = new Date();
        }

        // Generate JavaScript Date objects for older points
        globalGraphData.forEach(item => {
            if (!item.rawDate && item.date !== 'Today') {
                item.rawDate = new Date(item.date);
            }
        });
        
        // Calculate and display averages
        calculateAverages(globalGraphData);

        // Initial Renders
        renderCalendar();
        renderGraph('all');
    });

    // --- CALENDAR CONTROLS ---
    document.getElementById('prevMonthBtn').addEventListener('click', () => {
        calendarDate.setMonth(calendarDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonthBtn').addEventListener('click', () => {
        calendarDate.setMonth(calendarDate.getMonth() + 1);
        renderCalendar();
    });

    // --- FILTER LOGIC ---
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderGraph(e.target.dataset.range);
        });
    });

    // --- DELETE ALL LOGIC ---
    document.getElementById('resetAllBtn').addEventListener('click', () => {
        if (!confirm("⚠️ DANGER ZONE ⚠️\n\nThis will completely wipe your history, graphs, Personal Best scores, and today's points.\n\nAre you sure you want to continue?")) {
            return;
        }

        if (!confirm("⛔️ FINAL WARNING ⛔️\n\nThis action cannot be undone. All your progress will be lost forever.\n\nPress OK to delete everything.")) {
            return;
        }

        const userInput = prompt("To confirm deletion, please type 'DELETE' in the box below:");
        
        if (userInput === 'DELETE') {
            chrome.storage.sync.clear(() => {
                alert("All data has been deleted. The extension is now fresh.");
                location.reload();
            });
        } else {
            alert("Deletion cancelled. Text did not match.");
        }
    });
});

// --- CALENDAR RENDERER ---
function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthYearLabel = document.getElementById('calendarMonthYear');
    grid.innerHTML = '';

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    monthYearLabel.innerText = calendarDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        const el = document.createElement('div');
        el.className = 'calendar-day-header';
        el.innerText = day;
        grid.appendChild(el);
    });

    // Empty slots for previous month
    for (let i = 0; i < firstDayIndex; i++) {
        const el = document.createElement('div');
        el.className = 'calendar-day empty';
        grid.appendChild(el);
    }

    const now = new Date();
    if (now.getHours() < 3) now.setDate(now.getDate() - 1);
    const localNowStr = getLocalBusinessDateString(now);

    for (let i = 1; i <= daysInMonth; i++) {
        const el = document.createElement('div');
        el.className = 'calendar-day';
        
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        const dateNum = document.createElement('div');
        dateNum.className = 'date-num';
        dateNum.innerText = i;
        el.appendChild(dateNum);

        // Does this date exist in our data?
        const dayData = globalGraphData.find(d => 
            d.date === dateStr || (dateStr === localNowStr && d.date === 'Today')
        );

        if (dayData) {
            const score = dayData.score;
            const tierInfo = getTierInfo(score);

            el.classList.add(tierInfo.class);

            const scoreEl = document.createElement('div');
            scoreEl.className = 'score';
            scoreEl.innerText = score;
            
            el.appendChild(scoreEl);
        }

        // Highlight current active day
        if (dateStr === localNowStr) {
            el.classList.add('today');
        }

        grid.appendChild(el);
    }
}

// --- GRAPH RENDERER ---
function renderGraph(range) {
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    
    const filteredData = globalGraphData.filter(point => {
        if (range === 'all') return true;
        const diffDays = (now - point.rawDate) / msPerDay;
        
        if (range === 'year') return diffDays <= 365;
        if (range === 'month') return diffDays <= 30;
        if (range === 'week') return diffDays <= 7;
        
        return true;
    });

    drawChart(filteredData);
}

function drawChart(data) {
    const canvas = document.getElementById('historyChart');
    const ctx = canvas.getContext('2d');
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;
    const padding = { top: 40, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) {
        ctx.fillStyle = '#9aa0a6';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("No history data available for this range.", width / 2, height / 2);
        return;
    }

    const maxScore = Math.max(...data.map(d => d.score), 10);
    const yRatio = chartHeight / maxScore;
    const xStep = chartWidth / Math.max(data.length - 1, 1);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillStyle = '#9aa0a6';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
        const val = Math.round(maxScore * (i / 5));
        const y = padding.top + chartHeight - (val * yRatio);
        
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        ctx.fillText(val, padding.left - 10, y + 3);
    }

    ctx.beginPath();
    ctx.strokeStyle = '#38ef7d';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    data.forEach((point, index) => {
        const x = padding.left + (index * xStep);
        const y = padding.top + chartHeight - (point.score * yRatio);
        
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    if (data.length > 1) {
        ctx.lineTo(padding.left + ((data.length - 1) * xStep), padding.top + chartHeight);
        ctx.lineTo(padding.left, padding.top + chartHeight);
        ctx.closePath();
        const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
        gradient.addColorStop(0, 'rgba(56, 239, 125, 0.2)');
        gradient.addColorStop(1, 'rgba(56, 239, 125, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    ctx.fillStyle = '#202124'; 
    ctx.strokeStyle = '#fff'; 
    ctx.lineWidth = 2;

    data.forEach((point, index) => {
        const x = padding.left + (index * xStep);
        const y = padding.top + chartHeight - (point.score * yRatio);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    });
    
    ctx.fillStyle = '#9aa0a6';
    ctx.textAlign = 'center';
    const skip = Math.ceil(data.length / 8); 
    
    data.forEach((point, index) => {
        if (index % skip === 0 || index === data.length - 1) {
             const x = padding.left + (index * xStep);
             let label = point.date;
             if (label.length > 5 && label !== 'Today') label = label.substring(5);
             ctx.fillText(label, x, height - 15);
        }
    });
}