import {elements} from './elements';
import {getState, saveState, setOpenDay} from './state';
import {renderAll, renderSummary} from './render';
import {todayKey} from './utils';

const state = getState();

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
        setOpenDay(newDate);
        renderAll();
        newDate = '';
    }
}

export function onSaveEditDay() {
    const newDate = ''; //elements.editDayInput.value;
    const oldDate = state.openDay;

    if (!newDate) {
        alert('Pick a valid date');
        return;
    }

    if (newDate === oldDate) {
        // cancel
        return;
    }

    // Handle existing target date
    if (state.days[newDate]) {
        if (!confirm('Target day already exists. Merge current entries into that day?')) {
            return;
        }
        // Merge entries
        state.days[newDate] = (state.days[newDate] || []).concat(state.days[oldDate]);
    } else {
        // Move entries
        state.days[newDate] = state.days[oldDate];
    }

    delete state.days[oldDate];
    state.openDay = newDate;
    saveState();
    renderAll();
    // cancel
}

export function deleteOpenDay() {
    if (!confirm('Delete all entries for this day? This cannot be undone.')) {
        return;
    }

    delete state.days[state.openDay];
    setOpenDay(todayKey());
    renderAll();
}