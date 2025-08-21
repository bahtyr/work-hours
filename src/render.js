import {elements} from './elements.js';
import {getState, saveState, setOpenDay} from './state.js';
import {escapeHtml, findLast, fmtHM, parseHM, todayKey} from './utils.js';

const state = getState();

export function renderAll(scrollBottom = false) {
    renderTabs();
    renderTable();
    renderSummary();
    updateRunningUI();
    updateDayTotal();

    if (scrollBottom) {
        elements.tbody.parentElement.scrollTop = elements.tbody.scrollHeight;
    }
}

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
        tabEl.textContent = day === today ? 'Today' : day;
        tabEl.title = day;
        tabEl.addEventListener('click', () => setOpenDay(day));
        elements.tabs.appendChild(tabEl);
    });
}

export function renderTable() {
    const entries = state.days[state.openDay] || [];
    elements.tbody.innerHTML = '';

    entries.forEach((entry, index) => {
        const row = createTableRow(entry, index, entries);
        elements.tbody.appendChild(row);
    });
}

export function createTableRow(entry, index, entries) {
    const tr = document.createElement('tr');
    tr.draggable = true;
    tr.className = 'draggable';

    // Drag and drop handlers
    tr.ondragstart = (ev) => {
        ev.dataTransfer.setData('text/plain', index);
    };
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

    // Create cells
    tr.appendChild(createTimeCell(entry, 'start'));
    tr.appendChild(createTimeCell(entry, 'end'));
    tr.appendChild(createDescriptionCell(entry));
    tr.appendChild(createDeleteCell(index, entries));

    return tr;
}

export function createTimeCell(entry, field) {
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
    };
    td.appendChild(input);
    return td;
}

export function createDescriptionCell(entry) {
    const td = document.createElement('td');
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Description';
    input.value = entry.desc || '';
    input.oninput = () => {
        entry.desc = input.value;
        saveState();
        renderSummary();
    };
    td.appendChild(input);
    return td;
}

export function createDeleteCell(index, entries) {
    const td = document.createElement('td');
    td.style.textAlign = 'center';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'danger-small';
    deleteBtn.textContent = 'Delete';
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

export function renderSummary() {
    const entries = state.days[state.openDay] || [];
    const totals = new Map();

    // Calculate totals by description
    for (const entry of entries) {
        const start = parseHM(entry.start);
        const end = parseHM(entry.end);

        if (start !== null && end !== null && end >= start) {
            const minutes = end - start;
            const key = entry.desc || '(no description)';
            totals.set(key, (totals.get(key) || 0) + minutes);
        }
    }

    if (totals.size === 0) {
        elements.summary.innerHTML = '<div class="muted">Summary will appear here for completed entries.</div>';
        return;
    }

    // Build summary table
    let html = '<table style="width:100%;"><thead><tr><th style="text-align:left;">Description</th><th style="text-align:right;">Total (h:mm)</th></tr></thead><tbody>';

    [...totals.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([desc, minutes]) => {
            html += `<tr><td>${escapeHtml(desc)}</td><td style="text-align:right;">${fmtHM(minutes)}</td></tr>`;
        });

    html += '</tbody></table>';
    elements.summary.innerHTML = html;
}

export function updateRunningUI() {
    const entries = state.days[state.openDay] || [];
    const running = findLast(entries, e => e.start && !e.end);
    elements.runningPill.style.display = running ? 'inline-flex' : 'none';
}

export function updateDayTotal() {
    const entries = state.days[state.openDay] || [];
    let totalMinutes = 0;

    for (const entry of entries) {
        const start = parseHM(entry.start);
        const end = parseHM(entry.end);

        if (start !== null && end !== null && end >= start) {
            totalMinutes += (end - start);
        }
    }

    elements.dayTotal.textContent = totalMinutes ? `Day total: ${fmtHM(totalMinutes)}` : '';
}

export function focusLastDescription() {
    const inputs = elements.tbody.querySelectorAll('input[type="text"]');
    if (inputs.length) {
        inputs[inputs.length - 1].focus();
    }
}