import {todayKey} from './utils.js';
import {renderAll} from "./render";

const STORAGE_KEY = 'simpleTimesheetV3';

let state = loadState();

if (!state.days) state.days = {};
if (!state.openDay) state.openDay = todayKey();

ensureDay(state.openDay);
saveState();

export function getState() {
    return state;
}

function loadState() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

export function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Initiates the day if it isn't created yet
 */
export function ensureDay(day) {
    if (!state.days[day]) state.days[day] = [];
}

export function setOpenDay(day) {
    state.openDay = day;
    ensureDay(day);
    saveState();
    renderAll();
}
