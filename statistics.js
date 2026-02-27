let globalGraphData = [];

document.addEventListener('DOMContentLoaded', () => {
    // Set date
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Load Data
    chrome.storage.sync.get(['dailyScore', 'personalBest', 'customGoal', 'history', 'lastActiveDate'], (data) => {
        const history = data.history || [];
        const dailyScore = data.dailyScore || 0;
        const lastDate = data.lastActiveDate;
        
        // Populate Cards
        document.getElementById('allTimePB').innerText = data.personalBest || 0;
        document.getElementById('currentScore').innerText = dailyScore;
        document.getElementById('totalDays').innerText = history.length + (dailyScore > 0 ? 1 : 0);

        // Populate Goal Input
        document.getElementById('goalInput').value = data.customGoal || 15;

        // Prepare Graph Data
        globalGraphData = [...history];
        
        // Add today if it's not already in history
        if (globalGraphData.length === 0 || globalGraphData[globalGraphData.length - 1].date !== lastDate) {
             if (dailyScore > 0) {
                 globalGraphData.push({ date: 'Today', score: dailyScore, rawDate: new Date() });
             }
        } else {
            globalGraphData[globalGraphData.length - 1].score = dailyScore;
            globalGraphData[globalGraphData.length - 1].date = 'Today';
            globalGraphData[globalGraphData.length - 1].rawDate = new Date();
        }

        // Generate JavaScript Date objects for older points to easily calculate ranges
        globalGraphData.forEach(item => {
            if (!item.rawDate) {
                item.rawDate = new Date(item.date);
            }
        });

        // Draw Chart (Default to All-Time)
        renderGraph('all');
    });

    // --- FILTER LOGIC ---
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active styling
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Render specific timeframe
            renderGraph(e.target.dataset.range);
        });
    });

    // --- GOAL SETTING LOGIC ---
    document.getElementById('saveGoalBtn').addEventListener('click', () => {
        const goalInput = document.getElementById('goalInput');
        let newGoal = parseInt(goalInput.value, 10);
        
        if (isNaN(newGoal) || newGoal < 1) {
            newGoal = 15; // Fallback
            goalInput.value = newGoal;
        }

        chrome.storage.sync.set({ customGoal: newGoal }, () => {
            const btn = document.getElementById('saveGoalBtn');
            btn.innerText = "Saved!";
            btn.style.background = "#38ef7d";
            
            setTimeout(() => {
                btn.innerText = "Save Goal";
                btn.style.background = "#8ab4f8";
            }, 2000);
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

function renderGraph(range) {
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    
    // Filter data based on time range selected
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
    
    // Resize canvas for high DPI
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

    // Clear
    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) {
        ctx.fillStyle = '#9aa0a6';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("No history data available for this range.", width / 2, height / 2);
        return;
    }

    // Find Max Score for Y-Axis scaling
    const maxScore = Math.max(...data.map(d => d.score), 10); // Minimum scale of 10
    const yRatio = chartHeight / maxScore;
    const xStep = chartWidth / Math.max(data.length - 1, 1);

    // Draw Grid Lines (Y-Axis)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillStyle = '#9aa0a6';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
        const val = Math.round(maxScore * (i / 5));
        const y = padding.top + chartHeight - (val * yRatio);
        
        // Line
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        // Label
        ctx.fillText(val, padding.left - 10, y + 3);
    }

    // Draw Line Graph
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

    // Draw Gradient Area under line (only if there's more than 1 point to form an area)
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

    // Draw Points
    ctx.fillStyle = '#202124'; // Dot inner
    ctx.strokeStyle = '#fff'; // Dot border
    ctx.lineWidth = 2;

    data.forEach((point, index) => {
        const x = padding.left + (index * xStep);
        const y = padding.top + chartHeight - (point.score * yRatio);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    });
    
    // X-Axis Labels (Date) - Show only some if too many
    ctx.fillStyle = '#9aa0a6';
    ctx.textAlign = 'center';
    const skip = Math.ceil(data.length / 8); // Max 8 labels
    
    data.forEach((point, index) => {
        if (index % skip === 0 || index === data.length - 1) {
             const x = padding.left + (index * xStep);
             let label = point.date;
             // Shorten date string if needed
             if (label.length > 5 && label !== 'Today') label = label.substring(5); // Remove Year "MM-DD"
             ctx.fillText(label, x, height - 15);
        }
    });
}