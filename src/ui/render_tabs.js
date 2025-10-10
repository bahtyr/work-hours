import {formatDayName, todayKey} from "../utils";
import {stateManager} from "../data";
import {elements} from "../constants";
import {renderAll} from "./controller";

export function renderTabs() {
    const today = todayKey();
    const allDays = stateManager.getDayNames();
    allDays.add(today);

    const otherDays = Array.from(allDays)
        .filter(d => d !== today)
        .sort((a, b) => b.localeCompare(a));
    const orderedDays = [today, ...otherDays];

    elements.tabs.innerHTML = '';

    orderedDays.forEach(dayKey => {
        const dayInfo = stateManager.getDayInfo(dayKey);
        const tabEl = document.createElement('div');
        tabEl.className = 'tab' + (dayKey === stateManager.openDay ? ' active' : '');
        tabEl.title = dayKey;

        const textEl = document.createElement('span');
        // Prefer name, fallback to formatted date
        textEl.textContent = dayInfo.name && dayInfo.name.trim() ? dayInfo.name : formatDayName(dayInfo.date || dayKey);
        tabEl.appendChild(textEl);

        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent tab click
            deleteOpenDay();
        });
        tabEl.appendChild(deleteBtn);

        tabEl.addEventListener('click', () => {
            stateManager.setOpenDay(dayKey);
            renderAll();
        });

        elements.tabs.appendChild(tabEl);
    });
}

export function deleteOpenDay() {
    if (!confirm('Delete all entries for this day? This cannot be undone.')) {
        return;
    }
    stateManager.deleteDay(stateManager.openDay);
    stateManager.setOpenDay(todayKey());
    renderAll();
}

export function onAddDay() {
    let newDate = ''; //elements.addDayInput.value;
    if (newDate) {
        stateManager.setOpenDay(newDate);
        renderAll();
    }
}