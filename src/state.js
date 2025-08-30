import {todayKey} from './utils.js';

const STORAGE_KEY = 'simpleTimesheetV3';

let state = loadState();

if (!state.days) state.days = {};
if (!state.openDay) state.openDay = todayKey();

initDay(state.openDay);
saveState();

function loadState() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

export function getState() {
    return state;
}

export function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Initiates the day if it isn't created yet
 */
function initDay(day) {
    if (!state.days[day]) state.days[day] = [];
}

/**
 * Changes the day, initiates the day, saves this day as current day
 * @param day
 */
export function setOpenDay(day) {
    state.openDay = day;
    initDay(day);
    saveState();
}
