import {constants} from "../constants";
import {renderSummary} from "./render_summary_table";
import {renderTabs} from "./render_tabs";
import {updateDayTotal} from "./render_day_summary";
import {renderHoursTable} from "./render_hours_table";

renderAll();

export function renderAll(scrollBottom = false) {
    // return
    renderTabs();
    renderHoursTable();
    updateDayTotal();
    renderSummary();

    if (scrollBottom) {
        constants.hoursTableBody.parentElement.scrollTop = constants.hoursTableBody.scrollHeight;
    }
}