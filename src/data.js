import {findLast, roundHM, timeNow, todayKey, uid} from "./utils";

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

    #saveState() {
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
        this.#saveState();
    }

    deleteDay(day) {
        delete this.state.days[day];
        this.#saveState();
        this.notify();
    }

    // Entries

    #initEntries(day) {
        // Backward compatibility: if day is missing, create with default structure
        if (!this.state.days[day]) {
            this.state.days[day] = {
                entries: [],
                name: '', // custom label
                date: day, // ISO string
                workHours: 8 // default
            };
        } else if (Array.isArray(this.state.days[day])) {
            // Old format: array of entries only
            this.state.days[day] = {
                entries: this.state.days[day],
                name: '',
                date: day,
                workHours: 8
            };
        }
    }

    getEntries() {
        this.#initEntries(this.state.openDay);
        return this.state.days[this.state.openDay].entries;
    }
    
    getDayInfo(dayKey = this.openDay) {
        this.#initEntries(dayKey);
        return this.state.days[dayKey];
    }

    updateDay(dayKey, updates) {
        this.#initEntries(dayKey);
        Object.assign(this.state.days[dayKey], updates);
        this.#saveState();
        this.notify();
    }

    getLastEntry() {
        const entries = this.getEntries();
        return entries[entries.length - 1];
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
        this.#saveState();
        this.notify();
    }

    updateEntry(entryId, updates) {
        const entries = this.getEntries();
        const entry = entries.find(e => e.id === entryId);
        if (!entry) return false;

        Object.assign(entry, updates);
        this.#saveState();
        this.notify();
        return true;
    }

    stopLastRunningEntry() {
        const running = findLast(this.getEntries(), e => e.start && !e.end);
        if (!running) return false;

        running.end = roundHM(timeNow());
        this.#saveState();
        this.notify();
        return true;
    }

    deleteEntry(indexOrId) {
        const entries = this.getEntries();
        let index = typeof indexOrId === 'number' ? indexOrId : entries.findIndex(e => e.id === indexOrId);
        if (index === -1) return false;
        entries.splice(index, 1);
        this.#saveState();
        this.notify();
        return true;
    }

    moveEntry(fromIndex, toIndex) {
        const entries = this.getEntries();
        if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= entries.length || toIndex >= entries.length) return false;
        const item = entries.splice(fromIndex, 1)[0];
        entries.splice(toIndex, 0, item);
        this.#saveState();
        this.notify();
        return true;
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