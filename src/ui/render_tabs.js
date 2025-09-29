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

    orderedDays.forEach(day => {
        const tabEl = document.createElement('div');
        tabEl.className = 'tab' + (day === stateManager.openDay ? ' active' : '');
        tabEl.title = day;

        const textEl = document.createElement('span');
        textEl.textContent = formatDayName(day);
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
            stateManager.setOpenDay(day);
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