import {elements} from './elements';
import {renderAll, renderSummary} from './render';
import {todayKey} from './utils';
import {stateManager} from "./state";

// Summary

elements.toggleSummaryBtn.addEventListener('click', toggleSummary);

export function toggleSummary() {
    renderSummary();
    elements.hoursTable.classList.toggle('hidden');
    elements.summary.classList.toggle('hidden');
}

// Days

export function onAddDay() {
    let newDate = ''; //elements.addDayInput.value;
    if (newDate) {
        stateManager.setOpenDay(newDate);
        renderAll();
    }
}

export function deleteOpenDay() {
    if (!confirm('Delete all entries for this day? This cannot be undone.')) {
        return;
    }
    stateManager.deleteDay(stateManager.openDay);
    stateManager.setOpenDay(todayKey());
    renderAll();
}