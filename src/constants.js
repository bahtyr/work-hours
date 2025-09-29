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
    {priority: 2, label: 'Work', emoji: '⠀\n', keywords: []},  // everything else
    {priority: 0, label: 'Ticket', emoji: '📘️', keywords: []}, // identified by ticket regex
    {priority: 1, label: 'Meeting', emoji: '📞', keywords: ['meet', 'call', 'ask', 'msg', 'message']},
    {priority: 3, label: 'Break', emoji: '🧋', keywords: ['ara', 'break', 'lunch']},
];