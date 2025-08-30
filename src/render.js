import {elements, locators} from './elements';
import {getState, saveState, setOpenDay} from './state';
import {
    escapeHtml,
    findTicketNumber,
    formatDayName,
    formatMinutes,
    identifyTicketType,
    parseHM,
    todayKey
} from './utils';

const state = getState();
const gapRows = new Map();

export function renderAll(scrollBottom = false) {
    // return
    renderTabs();
    renderTable();
    updateDayTotal();
    renderSummary();

    if (scrollBottom) {
        elements.hoursTableBody.parentElement.scrollTop = elements.hoursTableBody.scrollHeight;
    }
}

// Tabs

function renderTabs() {
    const today = todayKey();
    const allDays = new Set(Object.keys(state.days || {}));
    allDays.add(today);

    // Order: today first, then others newest to oldest
    const otherDays = Array.from(allDays)
        .filter(d => d !== today)
        .sort((a, b) => b.localeCompare(a));
    const orderedDays = [today, ...otherDays];

    elements.tabs.innerHTML = '';

    orderedDays.forEach(day => {
        const tabEl = document.createElement('div');
        tabEl.className = 'tab' + (day === state.openDay ? ' active' : '');
        tabEl.textContent = formatDayName(day);
        tabEl.title = day;
        tabEl.addEventListener('click', () => {
            setOpenDay(day);
            renderAll();
        });
        elements.tabs.appendChild(tabEl);
    });
}

// Table

function renderTable() {
    const entries = state.days[state.openDay] || [];
    const tbody = elements.hoursTableBody;
    tbody.innerHTML = '';
    gapRows.clear();

    entries.forEach((entry, index) => {
        const row = createTableRow(entry, index, entries);
        tbody.appendChild(row);

        // Create gap after previous entry
        if (index > 0) updateGapAfter(entries[index - 1]);
    });
}

function createTableRow(entry, index, entries) {
    const tr = document.createElement('tr');
    tr.dataset.entryId = entry.id;

    tr.ondragover = (ev) => ev.preventDefault();
    tr.ondrop = (ev) => {
        ev.preventDefault();
        const from = +ev.dataTransfer.getData('text/plain');
        const to = index;
        if (from !== to) {
            const item = entries.splice(from, 1)[0];
            entries.splice(to, 0, item);
            saveState();
            renderAll();
        }
    };

    const durationCell = createDurationCell();

    // Create start and end cells and update duration when input changes
    const startCell = createTimeCell(entry, 'start', () => updateDurationCell(entry, durationCell));
    const endCell = createTimeCell(entry, 'end', () => updateDurationCell(entry, durationCell));

    tr.appendChild(startCell);
    tr.appendChild(endCell);
    tr.appendChild(durationCell);
    tr.appendChild(createTypeCell(entry));
    tr.appendChild(createDescriptionCell(entry));
    tr.appendChild(createDeleteCell(index, entries));
    tr.appendChild(createDragHandleCell(index));

    // Initialize duration immediately
    updateDurationCell(entry, durationCell);

    return tr;
}

function createTimeCell(entry, field, onChange) {
    const td = document.createElement('td');
    const input = document.createElement('input');
    input.type = 'time';
    input.step = 60;
    input.value = entry[field] || '';

    input.oninput = () => {
        entry[field] = input.value;
        saveState();
        updateDayTotal();

        // Update gap after this entry and gap after previous entry
        const entries = state.days[state.openDay] || [];
        const index = entries.indexOf(entry);
        if (index > 0) updateGapAfter(entries[index - 1]);
        updateGapAfter(entry);

        if (onChange) onChange();
    };

    td.appendChild(input);
    return td;
}

function createDurationCell() {
    const td = document.createElement('td');
    td.textContent = '-'; // default
    return td;
}

function updateDurationCell(entry, td) {
    if (entry.start && entry.end) {
        const start = parseHM(entry.start);
        const end = parseHM(entry.end);
        const minutes = end - start;
        if (minutes === 0)
            td.textContent = '';
        else td.textContent = formatMinutes(minutes);
    } else {
        td.textContent = '';
    }
}

function createDescriptionCell(entry) {
    const td = document.createElement('td');
    const input = document.createElement('input');
    input.classList.add('description');
    input.type = 'text';
    // console.log(entry);
    input.placeholder = (entry.type && entry.type === 3) ? 'Break' : 'Description';
    input.value = entry.desc || '';
    input.oninput = () => {
        entry.desc = input.value;

        // identify entry type based on description
        const identifiedType = identifyTicketType(entry.desc);
        // update entry type and row icon
        const row = input.closest('tr');
        const btn = row.querySelector(locators.entryTypeBtn);
        btn.textContent = types[identifiedType].emoji;
        entry.type = identifiedType;
        updateDayTotal();

        saveState();
    };
    input.addEventListener('keydown', e => {
        if ((e.key === 'Backspace' || e.key === 'Delete') && input.value === '') {
            const row = input.closest('tr');
            const btn = row.querySelector(locators.entryDeleteBtn);
            btn.click();
        }
        // if (e.key === 'Enter') {
        //     onNew();
        // }
    });
    td.appendChild(input);
    return td;
}

// Table Row Actions

const types = [
    {label: "Work", emoji: "📄"},
    {label: "Ticket", emoji: "📘️"},
    {label: "Meeting", emoji: "📞"},
    {label: "Break", emoji: "🧋"},
];

function createTypeCell(entry) {
    const td = document.createElement('td');
    const btn = document.createElement('button');
    btn.classList.add('action');
    btn.classList.add('bigger');
    btn.classList.add('type');
    btn.classList.add('type-' + entry.type);

    // default type if not set
    // if (typeof entry.type !== "number") {
    //     entry.type = 0; // Work
    // }
    //
    // if (entry.type === 99) {
    //     // entry.type = 0;
    // }
    btn.textContent = types[entry.type].emoji;

    // cycle to next type
    btn.onclick = () => {
        btn.classList.remove('type-' + entry.type);
        entry.type = (entry.type + 1) % types.length;
        btn.textContent = types[entry.type].emoji;
        btn.classList.add('type-' + entry.type);
        saveState();
        updateDayTotal();
    };

    td.appendChild(btn);
    return td;
}

function createDeleteCell(index, entries) {
    const td = document.createElement('td');
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('action', 'delete');
    deleteBtn.textContent = 'x';
    deleteBtn.onclick = () => {
        if (confirm('Delete this entry?')) {
            entries.splice(index, 1);
            saveState();
            renderAll();
        }
    };

    td.appendChild(deleteBtn);
    return td;
}

function createDragHandleCell(index) {
    const td = document.createElement('td');
    const handle = document.createElement('span');
    handle.classList.add('action');
    handle.textContent = '☰'; // you can replace with an SVG/icon
    handle.draggable = true;

    handle.ondragstart = (ev) => {
        ev.dataTransfer.setData('text/plain', index);

        // Create a temporary clone of the row for drag image
        const tr = handle.closest('tr');
        const dragClone = tr.cloneNode(true);
        dragClone.style.position = 'absolute';
        dragClone.style.top = '-9999px'; // hide offscreen
        document.body.appendChild(dragClone);

        // Use the clone as the drag image
        ev.dataTransfer.setDragImage(dragClone, 0, 0);

        // Remove it shortly after
        setTimeout(() => document.body.removeChild(dragClone), 0);
    };

    td.appendChild(handle);
    return td;
}

// Gap Row

function createGapRow(minutes, isOverlap = false) {
    const tr = document.createElement('tr');
    tr.classList.add('gap-row');
    tr.appendChild(document.createElement('td'));
    tr.appendChild(document.createElement('td'));

    const duration = document.createElement('td');
    duration.textContent = `${formatMinutes(minutes)}`;
    tr.appendChild(duration);
    tr.appendChild(document.createElement('td'));

    const desc = document.createElement('td');
    const descInput = document.createElement('input');
    desc.colSpan = 3;
    descInput.type = 'text';
    descInput.value = `${isOverlap ? 'Overlap' : 'Gap'}`;
    descInput.disabled = true;
    desc.appendChild(descInput);
    tr.appendChild(desc);
    return tr;
}

function updateGapAfter(prevEntry) {
    const entries = state.days[state.openDay] || [];
    const tbody = elements.hoursTableBody;
    const index = entries.indexOf(prevEntry);
    if (index === -1) return;

    const nextEntry = entries[index + 1];

    // Remove old gap/overlap row if exists
    if (gapRows.has(prevEntry.id)) {
        gapRows.get(prevEntry.id).remove();
        gapRows.delete(prevEntry.id);
    }

    if (nextEntry && prevEntry.end && nextEntry.start) {
        const prevEnd = parseHM(prevEntry.end);
        const nextStart = parseHM(nextEntry.start);
        const diff = nextStart - prevEnd;

        if (diff !== 0) { // gap or overlap
            const gapRow = createGapRow(Math.abs(diff), diff < 0); // negative → overlap
            gapRows.set(prevEntry.id, gapRow);

            const prevRow = tbody.querySelector(`tr[data-entry-id="${prevEntry.id}"]`);
            if (prevRow) {
                tbody.insertBefore(gapRow, prevRow.nextSibling);
            }
        }
    }
}

// Summary

export function renderSummary() {
    const entries = state.days[state.openDay] || [];
    const grouped = []; // will store { type, key, minutes, descs }

    // Count totals for matching entries
    for (const entry of entries) {
        const start = parseHM(entry.start);
        const end = parseHM(entry.end);

        if (start === null || end === null || end < start) continue;

        const minutes = end - start;
        const entryDesc = entry.desc || "(no description)";
        const entryType = entry.type ?? 0;

        // Try to detect a Jira ticket key, e.g. "TUE-250"
        const ticketMatch = findTicketNumber(entryDesc);

        let key, desc;
        if (!ticketMatch) {
            key = entryDesc;
            desc = null;
        } else {
            const ticketKey = ticketMatch[0].toUpperCase();
            const ticketDesc = entryDesc.replace(ticketMatch[0], "").trim();
            key = ticketKey;
            desc = ticketDesc || null;
        }

        // find or create group
        let group = grouped.find(g => g.type === entryType && g.key === key);
        if (!group) {
            group = {type: entryType, key, minutes: 0, descs: new Set()};
            grouped.push(group);
        }

        group.minutes += minutes;
        if (desc) group.descs.add(desc);
    }

    // No table
    if (grouped.length === 0) {
        elements.summary.innerHTML =
            '<div class="muted">Summary will appear here for completed entries.</div>';
        return;
    }

    // Sort: first by type, then by key alphabetically
    const typeOrder = {
        0: 2, // work
        1: 0, // ticket
        2: 1, // meet
        3: 3, // break
    };
    grouped.sort((a, b) => {
        const orderA = typeOrder[a.type] ?? 999;
        const orderB = typeOrder[b.type] ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return a.key.localeCompare(b.key); // within type: A–Z
    });

    // Build table
    let html = `
        <table id="summaryTable">
            <thead>
                <tr>
                    <th style="width:110px;"></th>
                    <th style="width:110px;"></th>
                    <th style="width:64px;">Duration</th>
                    <th style="width:14px;">Type</th>
                    <th>Description</th>
                    <th style="width:64px;"></th>
                    <th style="width:64px;"></th>
                </tr>
            </thead>
            <tbody>
    `;

    // Build rows
    for (const g of grouped) {
        let description = g.key;
        if (g.descs.size > 0) {
            description += " - " + [...g.descs].join(", ");
        }

        html += `
            <tr disabled="true">
                <td><input type="time" step="60" style="visibility: hidden"></td>
                <td><input type="time" step="60" style="visibility: hidden"></td>
                <td>${formatMinutes(g.minutes)}</td>
                <td><button class="action bigger type" disabled>${types[g.type]?.emoji || ""}</button></td>
                <td><input type="text" value="${escapeHtml(description)}" disabled/></td>
                <td></td>
                <td></td>
            </tr>
        `;
    }

    html += "</tbody></table>";
    elements.summary.innerHTML = html;
}

function updateDayTotal() {
    const entries = state.days[state.openDay] || [];
    const minutes = {ticket: 0, meeting: 0, break: 0, other: 0, total: 0};
    const uniqueTickets = new Set();

    // count total minutes per entry type
    for (const entry of entries) {
        const start = parseHM(entry.start);
        const end = parseHM(entry.end);

        if (start !== null && end !== null && end >= start) {
            const duration = end - start;
            const ticketMatch = findTicketNumber(entry.desc);
            if (entry.type === 1 || ticketMatch) {
                uniqueTickets.add(ticketMatch ? ticketMatch[0] : "(no ticket number)");
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
    elements.totalTimeLeft.textContent = formatMinutes((8 * 60) - minutes.total);
    elements.breakTime.textContent = formatMinutes(minutes.break);
    // ticket count
    elements.ticketsCount.textContent = uniqueTickets.size + "";
    elements.ticketsCountLabel.textContent = uniqueTickets.size === 1 ? "ticket" : "tickets";
    // timeline percentage based on 8 hours
    const maxDayMinutes = 8 * 60;
    elements.timelineOther.style.width = (minutes.other / maxDayMinutes) * 100 + '%';
    elements.timelineTicket.style.width = (minutes.ticket / maxDayMinutes) * 100 + '%';
    elements.timelineBreak.style.width = (minutes.break / maxDayMinutes) * 100 + '%';
    elements.timelineMeeting.style.width = (minutes.meeting / maxDayMinutes) * 100 + '%';
}