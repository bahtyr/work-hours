import {ensureDay, getState, saveState, setOpenDay} from './state.js';
import {findLast, parseHM, timeNow, todayKey, uid} from './utils.js';
import {elements} from './elements.js';
import {focusLastDescription, renderAll} from './render.js';

const state = getState();

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
            entries.push({
                id: uid(),
                start: lastEntry.end,
                end: timeNow(),
                desc: '',
                type: 3,
            });
        }
    }

    entries.push({
        id: uid(),
        start: timeNow(),
        end: '',
        desc: '',
        ticket() {
            const ticketMatch = this.desc.match(/\b[a-zA-Z]+-\d+\b/);
            return ticketMatch ? ticketMatch[0] : null;
        },
        type: 'entry' // entry, gap, ticket, meeting ??
    });

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
        entries.push({
            id: uid(),
            start: timeNow(),
            end: '',
            desc: '',
            type: 3,
        });

        saveState();
        renderAll(true);
        focusLastDescription();
    }
}

// Summary

export function toggleSummary() {
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