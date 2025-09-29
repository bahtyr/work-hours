export const constants = {
    // tabs
    tabs: document.getElementById('tabs'),
    // tables
    hoursTable: document.getElementById('hoursTable'),
    hoursTableBody: document.getElementById('hoursTableBody'),
    summary: document.getElementById('summary'),
    // hours-summary
    workTime: document.querySelector('.work-time .number'),
    breakTime: document.querySelector('.break-time .number'),
    totalTimeLeft: document.querySelector('.total-time-left .number'),
    ticketsCount: document.querySelector('.tickets-count .number'),
    ticketsCountLabel: document.querySelector('.tickets-count .label'),
    // hours-summary timeline
    timelineOther: document.querySelector('.timeline .other'),
    timelineTicket: document.querySelector('.timeline .ticket'),
    timelineBreak: document.querySelector('.timeline .break'),
    timelineMeeting: document.querySelector('.timeline .meeting'),
    // buttons
    toggleSummaryBtn: document.getElementById('toggleSummaryBtn'),
};

export const locators = {
    entryTime: '#hoursTable input[type="time"]',
    entryDescription: '#hoursTable input.description',
    entryTypeBtn: 'button.action.type',
    entryDeleteBtn: 'button.action.delete',
};

export const types = [
    {label: 'Work', emoji: '⠀\n'},
    {label: 'Ticket', emoji: '📘️'},
    {label: 'Meeting', emoji: '📞'},
    {label: 'Break', emoji: '🧋'},
];