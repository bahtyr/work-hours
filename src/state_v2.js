import {findLast, roundHM, todayKey, uid} from "./utils";

const STORAGE_KEY = 'simpleTimesheetV3';

export class StateManager {

    constructor(storageKey) {
        this.state = this.loadState(storageKey)
        this.openDay = this.state.openDay;
        if (!this.state.days) this.state.days = {};
        if (!this.state.openDay) this.setOpenDay(todayKey())

        this.listeners = new Set();
    }


    // GET & SAVE

    getState() {
        return this.state;
    }

    loadState(storageKey) {
        try {
            return JSON.parse(localStorage.getItem(storageKey)) || {};
        } catch {
            return {};
        }
    }

    saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    }

    getCurrentDayEntries() {
        this.#initEntries(this.state.openDay)
        return this.state.days[this.state.openDay];
    }

    getDays() {
        return new Set(Object.keys(this.state.days || {}));
    }

    deleteDay(day) {
        delete this.state.days[day];
    }

    newEntry(start, end, desc, type) {
        this.getCurrentDayEntries().push({
            id: uid(),
            start: roundHM(start),
            end: roundHM(end),
            desc: desc,
            type: type,
        });
        this.saveState();
    }

    getLastEntry() {
        const entries = this.getCurrentDayEntries();
        return entries[entries.length - 1];
    }

    getLastUnfinishedEntry() {
        return findLast(this.getCurrentDayEntries(), e => e.start && !e.end);
    }

    //

    #initEntries(day) {
        if (!this.state.days[day]) this.state.days[day] = [];
    }

    /**
     * Changes the day, initiates the day, saves this day as current day
     * @param day
     */
    setOpenDay(day) {
        this.openDay = day;
        this.state.openDay = day;
        this.#initEntries(day);
        this.saveState();
    }

    // subscribe notify

    subscribe(listener) {
        this.listeners.add(listener);
    }

    notify() {
        for (const l of this.listeners) l(this.state);
    }
}

export const stateManager = new StateManager(STORAGE_KEY);