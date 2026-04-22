// --- FOCUS DAY VIEW LOGIC ---
;(() => {
    console.log("Focus Day View Loaded! 🎯 (Showing only completed + next task)");

    let focusDayEnabled = true;

    chrome.storage.sync.get(['focusDayEnabled'], (data) => {
        if (data.focusDayEnabled !== undefined) {
            focusDayEnabled = data.focusDayEnabled;
        }
        if (!focusDayEnabled) {
            removeAllHiddenClasses();
        }
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync' && changes.focusDayEnabled) {
            focusDayEnabled = changes.focusDayEnabled.newValue;
            if (!focusDayEnabled) {
                removeAllHiddenClasses();
            } else {
                applyFocusMode();
            }
        }
    });

    function removeAllHiddenClasses() {
        const taskChips = Array.from(document.querySelectorAll('.focus-hidden-task'));
        taskChips.forEach(chip => chip.classList.remove('focus-hidden-task'));
    }

    if (!document.getElementById('focus-day-styles')) {
        const style = document.createElement('style');
        style.id = 'focus-day-styles';
        style.innerHTML = `
            .focus-hidden-task {
                display: none !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    function applyFocusMode() {
        if (!focusDayEnabled) return;

        const viewSwitcherText = document.querySelector('[jsname="V67aGc"]')?.textContent.trim().toLowerCase() || "";
        const isDayView = window.location.href.includes('/r/day') || viewSwitcherText === 'day';

        // ✅ Only select actual chip elements, not the button wrapper divs
        const taskChips = Array.from(document.querySelectorAll('[data-eventid^="tasks_"][data-eventchip]'));

        console.log(`[Focus Day View] applyFocusMode running. isDayView: ${isDayView}, URL: ${window.location.href}, switcher text: '${viewSwitcherText}'`);
        console.log(`[Focus Day View] Found ${taskChips.length} task chips`);

        if (!isDayView) {
            taskChips.forEach(chip => chip.classList.remove('focus-hidden-task'));
            return;
        }

        let foundFirstUncompleted = false;

        taskChips.forEach(chip => {
            let isCompleted = false;

            if (chip.querySelector('s, strike, del') || chip.innerHTML.includes('line-through')) {
                isCompleted = true;
            } else if (chip.querySelector('button[aria-label*="uncomplet"]')) {
                isCompleted = true;
            } else if (chip.querySelector('button[aria-label*="complete"]')) {
                isCompleted = false;
            } else {
                const hiddenSpans = Array.from(chip.querySelectorAll('span')).filter(s => s.classList.length > 0 && s.textContent);
                for (let span of hiddenSpans) {
                    const txt = span.textContent.toLowerCase();
                    if (txt.includes('not completed')) { isCompleted = false; break; }
                    else if (txt.includes('completed')) { isCompleted = true; break; }
                }
            }

            if (isCompleted) {
                chip.classList.remove('focus-hidden-task');
            } else {
                if (!foundFirstUncompleted) {
                    chip.classList.remove('focus-hidden-task');
                    foundFirstUncompleted = true;
                } else {
                    chip.classList.add('focus-hidden-task');
                }
            }
        });
    }

    setTimeout(applyFocusMode, 1000);

    let focusDayDebounceTimer;
    const focusDayObserver = new MutationObserver(() => {
        clearTimeout(focusDayDebounceTimer);
        focusDayDebounceTimer = setTimeout(applyFocusMode, 100);
    });

    focusDayObserver.observe(document.body, { childList: true, subtree: true });
    setInterval(applyFocusMode, 2000);
})();