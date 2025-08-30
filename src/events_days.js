import {elements} from './elements';
import {getState, saveState, setOpenDay} from './state';
import {renderAll, renderSummary} from './render';
import {todayKey} from './utils';

const state = getState();

// Summary

export function toggleSummary() {
    renderSummary();
    elements.hoursTable.classList.toggle('hidden');
    elements.summary.classList.toggle('hidden');
}

// Days

export function onAddDay() {
    if (elements.addDayInput.value) {
        setOpenDay(elements.addDayInput.value);
        renderAll();
        elements.addDayInput.value = '';
    }
}

export function onEditDay() {
    elements.editDayInput.value = state.openDay;
    elements.editDayInput.style.display = 'inline-block';
    elements.saveEditDayBtn.style.display = 'inline-block';
    elements.cancelEditDayBtn.style.display = 'inline-block';
    elements.editDayInput.focus();
}

export function onCancelEditDay() {
    elements.editDayInput.style.display = 'none';
    elements.saveEditDayBtn.style.display = 'none';
    elements.cancelEditDayBtn.style.display = 'none';
}

export function onSaveEditDay() {
    const newDate = elements.editDayInput.value;
    const oldDate = state.openDay;

    if (!newDate) {
        alert('Pick a valid date');
        return;
    }

    if (newDate === oldDate) {
        onCancelEditDay();
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
    onCancelEditDay();
}

export function onDeleteDay() {
    if (!confirm('Delete all entries for this day? This cannot be undone.')) {
        return;
    }

    delete state.days[state.openDay];
    setOpenDay(todayKey());
    renderAll();
}