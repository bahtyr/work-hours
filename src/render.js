import {elements} from './elements.js';
import {getState, saveState, setOpenDay} from './state.js';
import {escapeHtml, findLast, formatDayName, formatMinutes, parseHM, todayKey} from './utils.js';

const state = getState();
const gapRows = new Map();


export function renderAll(scrollBottom = false) {
    renderTabs();
    renderTable();
    renderSummary();
    updateRunningUI();
    updateDayTotal();

    if (scrollBottom) {
        elements.hoursTableBody.parentElement.scrollTop = elements.hoursTableBody.scrollHeight;
    }
}

// Tabs

export function renderTabs() {
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
        tabEl.addEventListener('click', () => setOpenDay(day));
        elements.tabs.appendChild(tabEl);
    });
}

// Table

export function renderTable() {
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

export function createTableRow(entry, index, entries) {
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

export function createTimeCell(entry, field, onChange) {
    const td = document.createElement('td');
    const input = document.createElement('input');
    input.type = 'time';
    input.step = 60;
    input.value = entry[field] || '';

    input.oninput = () => {
        entry[field] = input.value;
        saveState();
        renderSummary();
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

export function createDurationCell() {
    const td = document.createElement('td');
    td.textContent = '-'; // default
    return td;
}

export function updateDurationCell(entry, td) {
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

export function createDescriptionCell(entry) {
    const td = document.createElement('td');
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = (entry.type && entry.type === 3) ? 'Break' : 'Description';
    input.value = entry.desc || '';
    input.oninput = () => {
        entry.desc = input.value;
        saveState();
        renderSummary();
    };
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

export function createTypeCell(entry) {
    const td = document.createElement('td');
    const btn = document.createElement('button');
    btn.classList.add('action');
    btn.classList.add('bigger');

    // default type if not set
    if (typeof entry.type !== "number") {
        entry.type = 0; // Work
    }

    btn.textContent = types[entry.type].emoji;

    // cycle to next type
    btn.onclick = () => {
        entry.type = (entry.type + 1) % types.length;
        btn.textContent = types[entry.type].emoji;
        saveState();
    };

    td.appendChild(btn);
    return td;
}

export function createDeleteCell(index, entries) {
    const td = document.createElement('td');
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('action');
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

export function createDragHandleCell(index) {
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

// Table Row Gap

export function createGapRow(minutes, isOverlap = false) {
    const tr = document.createElement('tr');
    tr.classList.add('gap-row');
    tr.appendChild(document.createElement('td'));
    tr.appendChild(document.createElement('td'));

    const duration = document.createElement('td');
    duration.textContent = `${formatMinutes(minutes)}`;
    tr.appendChild(duration);

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

export function updateGapAfter(prevEntry) {
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
    const totals = new Map(); // Stores total minutes per key
    const ticketDescriptions = new Map(); // Stores a set of descriptions for each Jira ticket

    // Count totals for matching entries
    for (const entry of entries) {
        const start = parseHM(entry.start);
        const end = parseHM(entry.end);

        if (start === null || end === null || end < start) continue;

        const minutes = end - start;
        const entryDesc = entry.desc || "(no description)";

        // Try to detect a Jira ticket key, e.g. "TUE-250"
        const ticketMatch = entryDesc.match(/\b[a-zA-Z]+-\d+\b/);

        if (!ticketMatch) {
            // No Jira key → find matching entry, increment total
            totals.set(entryDesc, (totals.get(entryDesc) || 0) + minutes);
        } else {
            // JIRA key → split key & description
            const ticketKey = ticketMatch[0].toUpperCase();
            const ticketDesc = entryDesc.replace(ticketMatch[0], "").trim();

            // create a set to store unique descriptions
            if (!ticketDescriptions.has(ticketKey))
                ticketDescriptions.set(ticketKey, new Set());
            // store descriptions separately
            if (ticketDesc)
                ticketDescriptions.get(ticketKey).add(ticketDesc);

            // increment total for the key
            totals.set(ticketKey, (totals.get(ticketKey) || 0) + minutes);
        }
    }

    // No table
    if (totals.size === 0) {
        elements.summary.innerHTML = '<div class="muted">Summary will appear here for completed entries.</div>';
        return;
    }

    // Build table
    let html = `
        <table id="summaryTable">
            <thead>
                <tr>
                    <th>Total</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Build table rows
    [...totals.entries()]
        // Sort alphabetically by description
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([key, minutes]) => {
            let description = key;

            // If it's a Jira ticket, append all its grouped notes
            if (ticketDescriptions.has(key)) {
                const ticketDesc = [...ticketDescriptions.get(key)].join(", ");
                if (ticketDesc)
                    description += " - " + ticketDesc;
            }

            html += `
                <tr>
                    <td>${formatMinutes(minutes)}</td>
                    <td>${escapeHtml(description)}</td>
                </tr>
            `;
        });

    html += "</tbody></table>";
    elements.summary.innerHTML = html;
}

export function updateDayTotal() {
    const entries = state.days[state.openDay] || [];
    let totalMinutes = 0;
    let ticketMinutes = 0;
    const uniqueTickets = new Set();

    for (const entry of entries) {
        const start = parseHM(entry.start);
        const end = parseHM(entry.end);

        if (start !== null && end !== null && end >= start) {
            const ticketMatch = entry.desc.match(/\b[a-zA-Z]+-\d+\b/);
            if (ticketMatch) {
                uniqueTickets.add(ticketMatch[0]); // store ticket ID
                ticketMinutes += (end - start);
            } else {
                totalMinutes += (end - start);
            }
        }
    }

    elements.hoursLogged.textContent = formatMinutes(totalMinutes + ticketMinutes);
    elements.hoursLeft.textContent = formatMinutes((8 * 60) - totalMinutes - ticketMinutes);
    elements.ticketsCount.textContent = uniqueTickets.size + "";
    elements.ticketsCountLabel.textContent = uniqueTickets.size === 1 ? "ticket" : "tickets";

    const maxDayMinutes = 8 * 60;
    const percent = (totalMinutes / maxDayMinutes) * 100;
    const percentH = (ticketMinutes / maxDayMinutes) * 100;
    elements.hoursTimeline.style.width = percent + '%';
    elements.hoursTimelineHighlight.style.width = percentH + '%';
}

// Other

export function updateRunningUI() {
    const entries = state.days[state.openDay] || [];
    const running = findLast(entries, e => e.start && !e.end);
    elements.runningPill.style.display = running ? 'inline-flex' : 'none';
}

export function focusLastDescription() {
    const inputs = elements.hoursTableBody.querySelectorAll('input[type="text"]');
    if (inputs.length) {
        inputs[inputs.length - 1].focus();
    }
}