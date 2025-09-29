import {focusLastDescription, parseHM, timeNow} from './utils';
import {renderAll} from './render';
import {locators} from './elements';
import {stateManager} from "./state";
import {isSummaryDisplayed, toggleSummary} from "./events_days";

function startNow() {
    stateManager.newEntry(timeNow(), '', '', 0);
    renderAll(true);
    focusLastDescription();
}

function startSinceLast() {
    const lastEntry = stateManager.getLastEntry();
    if (lastEntry && lastEntry.end) {
        const lastEnd = parseHM(lastEntry.end);
        const nowHM = parseHM(timeNow());
        if (nowHM >= lastEnd) {
            stateManager.newEntry(lastEntry.end, '', '', 3);
            renderAll(true);
            focusLastDescription();
        }
        return true;
    } else {
        return false;
    }
}

function stopLast() {
    const stoppedAnEntry = stateManager.stopLastRunningEntry();
    renderAll(true);
    return stoppedAnEntry;
}

document.addEventListener('keydown', onDocumentKeyDown);

/**
 * Navigate to other entries
 */
function handleArrowNavigation(e, active) {
    const inputs = Array.from(document.querySelectorAll(locators.entryDescription));
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

/**
 * Navigate between time inputs with Tab / Shift+Tab
 */
function handleTimeNavigation(e, active) {
    const inputs = Array.from(document.querySelectorAll(locators.entryTime));
    if (inputs.length === 0) return;

    let index = inputs.indexOf(active);

    if (index === -1) {
        inputs[0].focus();
        e.preventDefault();
        return;
    }

    const movePrev = e.shiftKey && e.key === 'Tab';
    const moveNext = !e.shiftKey && e.key === 'Tab';

    if (movePrev && index > 0) {
        inputs[index - 1].focus();
        e.preventDefault();
    } else if (moveNext && index < inputs.length - 1) {
        inputs[index + 1].focus();
        e.preventDefault();
    }
}

export function onDocumentKeyDown(e) {
    // ignore modifier keys
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    const active = document.activeElement;
    const focusedOnInput = active && active.tagName === 'INPUT';
    const focusedOnTime = focusedOnInput && active.type === 'time';
    const focusedOnText = focusedOnInput && active.type === 'text';

    // toggle edit/summary view
    if (!focusedOnInput && (e.key === 'v' || e.key === 'V')) {
        toggleSummary();
        return;
    }

    // prevent edit actions on hours table if summary is displayed
    if (isSummaryDisplayed()) {
        return;
    }

    // commit/unfocus an active input
    if (focusedOnInput && (e.key === 'Enter' || e.key === 'Escape')) {
        active.blur();
        return;
    }

    // stop the last entry or start a new one from now
    if (!focusedOnInput && e.key === 'Enter') {
        if (!stopLast()) {
            startNow();
            return;
        }
    }

    // stops the last entry or starts a new one since the last end time
    if (!focusedOnInput && e.key === ' ') {
        if (!stopLast()) {
            e.preventDefault();
            if (!startSinceLast()) {
                startNow();
            }
            return;
        }
    }

    // focus to previous/next entry description
    if (!focusedOnTime && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        handleArrowNavigation(e, active);
        return;
    }

    // navigate time fields
    if (focusedOnTime && e.key === 'Tab') {
        handleTimeNavigation(e, active);
        return;
    }

    // clear time and resets focus
    if (focusedOnTime && e.key === 'Backspace') {
        if (active.value.trim() === '') {
            e.preventDefault();
            active.value = '';
            active.blur();
            active.focus();
        }
    }
}
