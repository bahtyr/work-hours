import {todayKey} from "./utils";

const STORAGE_KEY = 'simpleTimesheetV3';

export class StateManager {

    constructor(storageKey) {
        try {
            this.state = JSON.parse(localStorage.getItem(storageKey)) || {};
        } catch {
            this.state = {};
            this.state.openDay = todayKey();
            this.state.days = {};
            this.#initDay(this.state.openDay);
        }
        this.listeners = new Set();
    }


    // GET & SAVE

    getState() {
        return this.state;
    }

    saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    }

    //

    #initDay(day) {
        if (!this.state.days[day]) this.state.days[day] = [];
    }

    /**
     * Changes the day, initiates the day, saves this day as current day
     * @param day
     */
    setOpenDay(day) {
        this.state.openDay = day;
        this.#initDay(day);
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