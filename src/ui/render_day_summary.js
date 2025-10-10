import {stateManager} from "../data";
import {findTicketNumber, formatMinutes, parseHM} from "../utils";
import {elements} from "../constants";

export function updateDayTotal() {
    const dayInfo = stateManager.getDayInfo();
    const workHours = dayInfo.workHours || 8;
    // Estimated end time logic
    let earliestStart = null;
    for (const entry of stateManager.getEntries()) {
        const start = parseHM(entry.start);
        if (start !== null && (earliestStart === null || start < earliestStart)) {
            earliestStart = start;
        }
    }
    let estimatedEndText = '';
    if (earliestStart !== null) {
        const endMinutes = earliestStart + workHours * 60;
        const endHour = Math.floor(endMinutes / 60);
        const endMinute = endMinutes % 60;
        // Format as "Estimated end: HH:MM AM/PM"
        let suffix = endHour >= 12 ? 'PM' : 'AM';
        let displayHour = endHour % 12;
        if (displayHour === 0) displayHour = 12;
        estimatedEndText = `Estimated end: ${displayHour}:${String(endMinute).padStart(2, '0')} ${suffix}`;
    }

    // Display estimated end time in a dedicated element (add to DOM if needed)
    if (!elements.estimatedEndTime) {
        // Create and insert if not present
        const el = document.createElement('div');
        el.className = 'estimated-end-time';
        elements.workTime.parentElement.appendChild(el);
        elements.estimatedEndTime = el;
    }
    elements.estimatedEndTime.textContent = estimatedEndText;
    const minutes = {ticket: 0, meeting: 0, break: 0, other: 0, total: 0};
    const uniqueTickets = new Set();

    // count total minutes per entry type
    for (const entry of stateManager.getEntries()) {
        const start = parseHM(entry.start);
        const end = parseHM(entry.end);

        if (start !== null && end !== null && end >= start) {
            const duration = end - start;
            const ticketMatch = findTicketNumber(entry.desc);
            if (entry.type === 1 || ticketMatch) {
                uniqueTickets.add(ticketMatch ? ticketMatch[0] : '(no ticket number)');
                minutes.ticket += duration;
            } else if (entry.type === 2)
                minutes.meeting += duration;
            else if (entry.type === 3)
                minutes.break += duration;
            else minutes.other += duration;
        }
    }

    // sum total
    minutes.total = minutes.ticket + minutes.meeting + minutes.break + minutes.other;
    // hours
    elements.workTime.textContent = formatMinutes(minutes.total - minutes.break);
    elements.totalTimeLeft.textContent = formatMinutes((workHours * 60) - minutes.total);
    elements.breakTime.textContent = formatMinutes(minutes.break);
    // ticket count
    elements.ticketsCount.textContent = uniqueTickets.size + '';
    elements.ticketsCountLabel.textContent = uniqueTickets.size === 1 ? 'ticket' : 'tickets';
    // timeline percentage based on workHours
    const maxDayMinutes = workHours * 60;
    elements.timelineOther.style.width = (minutes.other / maxDayMinutes) * 100 + '%';
    elements.timelineTicket.style.width = (minutes.ticket / maxDayMinutes) * 100 + '%';
    elements.timelineBreak.style.width = (minutes.break / maxDayMinutes) * 100 + '%';
    elements.timelineMeeting.style.width = (minutes.meeting / maxDayMinutes) * 100 + '%';
}