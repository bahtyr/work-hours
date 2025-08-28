import {getState, saveState} from './state.js';
import {findLast, parseHM, timeNow, uid} from './utils.js';
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

function stopLast() {
    const entries = state.days[state.openDay];
    const running = findLast(entries, e => e.start && !e.end);

    if (running && !running.end) {
        running.end = timeNow();
        saveState();
        renderAll(true);
        return true;
    }

    return false;
}

function startNew() {
    const entries = state.days[state.openDay];
    entries.push(newEntry(timeNow(), '', '', 0));
    saveState();
    renderAll(true);
    focusLastDescription();
}

function startBreakSinceLast() {
    // console.log("me")
    const entries = state.days[state.openDay];
    // Check for gap between last entry and now
    const lastEntry = entries[entries.length - 1];
    // create gap entry
    if (lastEntry && lastEntry.end) {
        // console.log("=1")
        const lastEnd = parseHM(lastEntry.end);
        const nowHM = parseHM(timeNow());
        if (nowHM >= lastEnd) {
            // console.log("=2")
            entries.push(newEntry(lastEntry.end, '', '', 3));
            saveState();
            renderAll(true);
            focusLastDescription();
        }
    }
}

/**
 * If no input is focused, redirect keystrokes to quick entry input
 */
export function onDocumentKeyDown(e) {
    // Ignore modifier keys
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    const active = document.activeElement;
    const focusedOnInput = active && active.tagName === 'INPUT';
    const focusedOnTime = focusedOnInput && active.type === 'time';
    const focusedOnText = focusedOnInput && active.type === 'text';


    // Handle arrow navigation between inputs
    if (!focusedOnTime && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        handleArrowNavigation(e, active);
        return;
    }

    if (focusedOnInput && (e.key === 'Enter' || e.key === 'Escape')) {
        active.blur();
        return;
    }

    if (!focusedOnInput && e.key === ' ') {
        if (!stopLast()) {
            startBreakSinceLast();
            return;
        }
    }

    if (!focusedOnInput && e.key === 'Enter') {
        if (!stopLast()) {
            startNew();
            return;
        }
    }

    // Handle global typing when no input focused
}

/**
 * Navigate to other entries
 */
function handleArrowNavigation(e, active) {
    const inputs = Array.from(document.querySelectorAll('input[type="text"]:not([disabled])'));
    if (inputs.length === 0) return;

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