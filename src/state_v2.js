import {findLast, roundHM, todayKey, uid} from "./utils";

const STORAGE_KEY = 'simpleTimesheetV3';

export class StateManager {
    // Constructor / Init

    constructor(storageKey) {
        this.state = this.#loadState(storageKey);
        this.openDay = this.state.openDay;
        if (!this.state.days) this.state.days = {};
        if (!this.state.openDay) this.setOpenDay(todayKey());

        this.listeners = new Set();
    }

    // State Load & Save

    #loadState(storageKey) {
        try {
            return JSON.parse(localStorage.getItem(storageKey)) || {};
        } catch {
            return {};
        }
    }

    saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    }

    getState() {
        return this.state;
    }

    // Day Management

    getDayNames() {
        return new Set(Object.keys(this.state.days || {}));
    }

    setOpenDay(day) {
        this.openDay = day;
        this.state.openDay = day;
        this.#initEntries(day);
        this.saveState();
    }

    deleteDay(day) {
        delete this.state.days[day];
    }

    // Entries

    #initEntries(day) {
        if (!this.state.days[day]) this.state.days[day] = [];
    }

    getEntries() {
        this.#initEntries(this.state.openDay);
        return this.state.days[this.state.openDay];
    }

    getLastEntry() {
        const entries = this.getEntries();
        return entries[entries.length - 1];
    }

    getLastUnfinishedEntry() {
        return findLast(this.getEntries(), e => e.start && !e.end);
    }

    // Entry Management

    newEntry(start, end, desc, type) {
        this.getEntries().push({
            id: uid(),
            start: roundHM(start),
            end: roundHM(end),
            desc: desc,
            type: type,
        });
        this.saveState();
    }

    // Subscription / Notification

    subscribe(listener) {
        this.listeners.add(listener);
    }

    notify() {
        for (const l of this.listeners) l(this.state);
    }
}

export const stateManager = new StateManager(STORAGE_KEY);