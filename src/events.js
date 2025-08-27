import {ensureDay, getState, saveState, setOpenDay} from './state.js';
import {findLast, findTicketNumber, parseHM, timeNow, todayKey, uid} from './utils.js';
import {elements} from './elements.js';
import {focusLastDescription, renderAll, renderSummary} from './render.js';

const state = getState();

function newEntry(start, end, desc, type) {
    return {
        id: uid(),
        start: start,
        end: end,
        desc: desc,
        type: type,
    };
}

// Start / Stop

export function onNew(desc) {
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
            entries.push(newEntry(lastEntry.end, timeNow(), '', 3));
        }
    }

    entries.push(newEntry(
        timeNow(),
        '',
        desc ?? '',
        findTicketNumber(desc) ? 1 : 0)
    );

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
        entries.push(newEntry(timeNow(), '', '', 3));

        saveState();
        renderAll(true);
        focusLastDescription();
    }
}

export function onQuickEntry(e) {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    const desc = elements.quickEntryInput.value.trim();
    if (!desc) return; // ignore empty

    onNew(desc);

    // Clear input and focus back
    elements.quickEntryInput.value = '';
    elements.quickEntryInput.focus();
}

/**
 * If no input is focused, redirect keystrokes to quick entry input
 */
export function onDocumentKeyDown(e) {
    const active = document.activeElement;
    const isInputFocused = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');

    // Ignore modifier keys
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    // Only trigger if nothing else is focused
    if (!isInputFocused) {
        const input = elements.quickEntryInput;
        input.focus();

        // Insert typed character (printable)
        if (e.key.length === 1) {
            const start = input.selectionStart || 0;
            const end = input.selectionEnd || 0;
            const value = input.value;
            input.value = value.slice(0, start) + e.key + value.slice(end);
            input.selectionStart = input.selectionEnd = start + 1;
        }

        // Prevent default so keys don’t trigger elsewhere
        e.preventDefault();
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