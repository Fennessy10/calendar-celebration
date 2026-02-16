document.addEventListener('DOMContentLoaded', () => {
    // Set date
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Load Data
    chrome.storage.sync.get(['dailyScore', 'personalBest', 'monthlyPersonalBest', 'history', 'lastActiveDate'], (data) => {
        const history = data.history || [];
        const dailyScore = data.dailyScore || 0;
        const lastDate = data.lastActiveDate;
        
        // Populate Cards
        document.getElementById('allTimePB').innerText = data.personalBest || 0;
        document.getElementById('monthlyPB').innerText = data.monthlyPersonalBest || 0;
        document.getElementById('totalDays').innerText = history.length + (dailyScore > 0 ? 1 : 0);

        // Prepare Graph Data
        const graphData = [...history];
        
        // Add today if it's not already in history
        if (graphData.length === 0 || graphData[graphData.length - 1].date !== lastDate) {
             if (dailyScore > 0) {
                 graphData.push({ date: 'Today', score: dailyScore });
             }
        } else {
            graphData[graphData.length - 1].score = dailyScore;
        }

        // Draw Chart
        drawChart(graphData);
    });

    // --- DELETE ALL LOGIC ---
    document.getElementById('resetAllBtn').addEventListener('click', () => {
        // Warning 1
        if (!confirm("⚠️ DANGER ZONE ⚠️\n\nThis will completely wipe your history, graphs, Personal Best scores, and today's points.\n\nAre you sure you want to continue?")) {
            return;
        }

        // Warning 2
        if (!confirm("⛔️ FINAL WARNING ⛔️\n\nThis action cannot be undone. All your progress will be lost forever.\n\nPress OK to delete everything.")) {
            return;
        }

        // Warning 3 (Type to confirm)
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

    if (data.length === 0) {
        ctx.fillStyle = '#9aa0a6';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("No history data available yet.", width / 2, height / 2);
        return;
    }

    // Find Max Score for Y-Axis scaling
    const maxScore = Math.max(...data.map(d => d.score), 10); // Minimum scale of 10
    const yRatio = chartHeight / maxScore;
    const xStep = chartWidth / Math.max(data.length - 1, 1);

    // Clear
    ctx.clearRect(0, 0, width, height);

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

    // Draw Gradient Area under line
    ctx.lineTo(padding.left + ((data.length - 1) * xStep), padding.top + chartHeight);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, 'rgba(56, 239, 125, 0.2)');
    gradient.addColorStop(1, 'rgba(56, 239, 125, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();

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