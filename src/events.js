import {ensureDay, getState, saveState, setOpenDay} from './state.js';
import {findLast, parseHM, timeNow, todayKey, uid} from './utils.js';
import {elements} from './elements.js';
import {focusLastDescription, renderAll, renderSummary} from './render.js';

const state = getState();

function newEntry(start, end, type) {
    return {
        id: uid(),
        start: start,
        end: end,
        desc: '',
        type: type,
    };
}

// Start / Stop

export function onNew() {
    const entries = state.days[state.openDay];
    const running = findLast(entries, e => e.start && !e.end);

    if (running) running.end = timeNow();

    // Check for gap between last entry and now
    const lastEntry = entries[entries.length - 1];
    // create gap entry
    if (lastEntry && lastEntry.end) {
        const lastEnd = parseHM(lastEntry.end);
        const nowHM = parseHM(timeNow());
        if (nowHM > lastEnd) {
            entries.push(newEntry(lastEntry.end, timeNow(), 3));
        }
    }

    entries.push(newEntry(timeNow(), '', 0));

    saveState();
    renderAll(true);
    focusLastDescription();
}

export function onStop() {
    const entries = state.days[state.openDay];
    const running = findLast(entries, e => e.start && !e.end);

    if (running && !running.end) {
        // create gap entry
        running.end = timeNow();
        entries.push(newEntry(timeNow(), '', 3));

        saveState();
        renderAll(true);
        focusLastDescription();
    }
}

// Summary

export function toggleSummary() {
    renderSummary();
    elements.hoursTable.classList.toggle('hidden');
    elements.summary.classList.toggle('hidden');
    elements.newBtn.disabled = !elements.newBtn.disabled;
    elements.stopBtn.disabled = !elements.stopBtn.disabled;
}

// Days

export function onAddDay() {
    if (elements.addDayInput.value) {
        setOpenDay(elements.addDayInput.value);
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
    state.openDay = todayKey();
    ensureDay(state.openDay);
    saveState();
    renderAll();
}