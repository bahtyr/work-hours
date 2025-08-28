import {ensureDay, getState, saveState, setOpenDay} from './state.js';
import {findLast, identifyTicketType, parseHM, timeNow, todayKey, uid} from './utils.js';
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
        identifyTicketType(desc))
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
    // when enter pressed submit
    e.preventDefault();

    const desc = elements.quickEntryInput.value.trim();

    onNew(desc);

    // Clear input and focus back
    elements.quickEntryInput.value = '';
    elements.quickEntryInput.focus();
}

/**
 * If no input is focused, redirect keystrokes to quick entry input
 */
export function onDocumentKeyDown(e) {
    // Ignore modifier keys
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    // Handle double ESC
    if (e.key === ' ') {
        onStop();
        return;
    }

    // Handle arrow navigation between inputs
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        handleArrowNavigation(e);
        return;
    }

    // Handle global typing when no input focused
}

function handleArrowNavigation(e) {
    const inputs = Array.from(document.querySelectorAll('input[type="text"]:not([disabled])'));
    if (inputs.length === 0) return;

    const active = document.activeElement;
    if (active && active.tagName === 'INPUT' && active.type !== 'text') {
        return;
    }
    let index = inputs.indexOf(active);

    // If nothing valid is focused → pick last input
    if (index === -1) {
        inputs[inputs.length - 1].focus();
        e.preventDefault();
        return;
    }

    if (e.key === 'ArrowUp' && index > 0) {
        inputs[index - 1].focus();
        e.preventDefault();
    } else if (e.key === 'ArrowDown' && index < inputs.length - 1) {
        inputs[index + 1].focus();
        e.preventDefault();
    }
}

let lastEscTime = 0;

function handleDoubleEscape() {
    const now = Date.now();
    if (now - lastEscTime < 400) {
        onDoubleEscape();   // run custom action
        lastEscTime = 0;    // reset
    } else {
        lastEscTime = now;
    }
}

function onDoubleEscape() {
    onStop();
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