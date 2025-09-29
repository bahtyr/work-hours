import {stateManager} from "../data";
import {findTicketNumber, formatMinutes, parseHM} from "../utils";
import {constants} from "../constants";

export function updateDayTotal() {
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
    constants.workTime.textContent = formatMinutes(minutes.total - minutes.break);
    constants.totalTimeLeft.textContent = formatMinutes((8 * 60) - minutes.total);
    constants.breakTime.textContent = formatMinutes(minutes.break);
    // ticket count
    constants.ticketsCount.textContent = uniqueTickets.size + '';
    constants.ticketsCountLabel.textContent = uniqueTickets.size === 1 ? 'ticket' : 'tickets';
    // timeline percentage based on 8 hours
    const maxDayMinutes = 8 * 60;
    constants.timelineOther.style.width = (minutes.other / maxDayMinutes) * 100 + '%';
    constants.timelineTicket.style.width = (minutes.ticket / maxDayMinutes) * 100 + '%';
    constants.timelineBreak.style.width = (minutes.break / maxDayMinutes) * 100 + '%';
    constants.timelineMeeting.style.width = (minutes.meeting / maxDayMinutes) * 100 + '%';
}