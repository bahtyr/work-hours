import {elements, locators} from './elements';
import {getState, saveState, setOpenDay} from './state';
import {
    escapeHtml,
    findTicketNumber,
    formatDayName,
    formatMinutes,
    identifyTicketType,
    parseHM, roundHM,
    todayKey
} from './utils';
import {deleteOpenDay} from "./events_days";

const state = getState();
const gapRows = new Map();
const types = [
    {label: 'Work', emoji: '⠀\n'},
    {label: 'Ticket', emoji: '📘️'},
    {label: 'Meeting', emoji: '📞'},
    {label: 'Break', emoji: '🧋'},
];

export function renderAll(scrollBottom = false) {
    // return
    renderTabs();
    renderHoursTable();
    updateDayTotal();
    renderSummary();

    if (scrollBottom) {
        elements.hoursTableBody.parentElement.scrollTop = elements.hoursTableBody.scrollHeight;
    }
}

// --------- Header //

function renderTabs() {
    const today = todayKey();
    const allDays = new Set(Object.keys(state.days || {}));
    allDays.add(today);

    const otherDays = Array.from(allDays)
        .filter(d => d !== today)
        .sort((a, b) => b.localeCompare(a));
    const orderedDays = [today, ...otherDays];

    elements.tabs.innerHTML = '';

    orderedDays.forEach(day => {
        const tabEl = document.createElement('div');
        tabEl.className = 'tab' + (day === state.openDay ? ' active' : '');
        tabEl.title = day;

        const textEl = document.createElement('span');
        textEl.textContent = formatDayName(day);
        tabEl.appendChild(textEl);

        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent tab click
            deleteOpenDay();
        });
        tabEl.appendChild(deleteBtn);

        tabEl.addEventListener('click', () => {
            setOpenDay(day);
            renderAll();
        });

        elements.tabs.appendChild(tabEl);
    });
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
    elements.totalTimeLeft.textContent = formatMinutes((8 * 60) - minutes.total);
    elements.breakTime.textContent = formatMinutes(minutes.break);
    // ticket count
    elements.ticketsCount.textContent = uniqueTickets.size + '';
    elements.ticketsCountLabel.textContent = uniqueTickets.size === 1 ? 'ticket' : 'tickets';
    // timeline percentage based on 8 hours
    const maxDayMinutes = 8 * 60;
    elements.timelineOther.style.width = (minutes.other / maxDayMinutes) * 100 + '%';
    elements.timelineTicket.style.width = (minutes.ticket / maxDayMinutes) * 100 + '%';
    elements.timelineBreak.style.width = (minutes.break / maxDayMinutes) * 100 + '%';
    elements.timelineMeeting.style.width = (minutes.meeting / maxDayMinutes) * 100 + '%';
}

// --------- Summary Table //

export function renderSummary() {
    const entries = state.days[state.openDay] || [];
    const grouped = []; // will store { type, key, minutes, descs }

    // Count totals for matching entries
    for (const entry of entries) {
        const start = parseHM(entry.start);
        const end = parseHM(entry.end);

        if (start === null || end === null || end < start) continue;

        const minutes = end - start;
        const entryDesc = entry.desc || '(no description)';
        const entryType = entry.type ?? 0;

        // Try to detect a Jira ticket key, e.g. "TUE-250"
        const ticketMatch = findTicketNumber(entryDesc);

        let key, desc;
        if (!ticketMatch) {
            key = entryDesc;
            desc = null;
        } else {
            const ticketKey = ticketMatch[0].toUpperCase();
            const ticketDesc = entryDesc.replace(ticketMatch[0], '').trim();
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
                    <th class="duration" style="width:100px;">Duration</th>
                    <th class="actions" style="width:14px;">Type</th>
                    <th class="description">Description</th>
                    <th class="time" style="width:70px;"></th>
                    <th class="time" style="width:70px;"></th>
                    <th class="actions" style="width:64px;"></th>
                    <th class="actions" style="width:64px;"></th>
                </tr>
            </thead>
            <tbody>
    `;

    // Build rows
    for (const g of grouped) {
        let description = g.key;
        if (g.descs.size > 0) {
            description += ' - ' + [...g.descs].join(', ');
        }

        html += `
            <tr disabled="true">
                <td class="duration">${formatMinutes(g.minutes)}</td>
                <td class="actions"><button class="action bigger type type-${g.type}" disabled>${types[g.type]?.emoji || ""}</button></td>
                <td class="description"><input type="text" value="${escapeHtml(description)}" disabled/></td>
                <td class="time"><input type="time" step="60" style="visibility: hidden"></td>
                <td class="time"><input type="time" step="60" style="visibility: hidden"></td>
                <td class="actions"></td>
                <td class="actions"></td>
            </tr>
        `;
    }

    html += "</tbody></table>";
    elements.summary.innerHTML = html;
}


// --------- Hours Table //

function renderHoursTable() {
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

    initSmoothRowDnD(tbody, entries);
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

    tr.appendChild(durationCell);
    tr.appendChild(createTypeCell(entry));
    tr.appendChild(createDescriptionCell(entry));
    tr.appendChild(startCell);
    tr.appendChild(endCell);
    tr.appendChild(createDeleteCell(index, entries));
    tr.appendChild(createDragHandleCell());

    // Initialize duration immediately
    updateDurationCell(entry, durationCell);

    return tr;
}

// Time

function createTimeCell(entry, field, onChange) {
    const td = document.createElement('td');
    const input = document.createElement('input');
    td.classList.add('time');
    input.type = 'time';
    input.step = 60;
    input.value = entry[field] || '';

    input.onblur = () => {
        if (input.value) {
            input.value = roundHM(input.value);
            update(input.value)
        }
    };

    input.oninput = () => {
        update(input.value)
    };

    function update(value) {
        entry[field] = value;
        saveState();
        updateDayTotal();

        // Update gap after this entry and gap after previous entry
        const entries = state.days[state.openDay] || [];
        const index = entries.indexOf(entry);
        if (index > 0) updateGapAfter(entries[index - 1]);
        updateGapAfter(entry);

        if (onChange) onChange();
    }

    td.appendChild(input);
    return td;
}

function createDurationCell() {
    const td = document.createElement('td');
    td.classList.add('duration');
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

// Description

function createTypeCell(entry) {
    const td = document.createElement('td');
    const btn = document.createElement('button');
    btn.classList.add('actions');
    btn.classList.add('action');
    btn.classList.add('bigger');
    btn.classList.add('type');
    btn.classList.add('type-' + entry.type);

    // default type if not set
    // if (typeof entry.type !== 'number') {
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

function createDescriptionCell(entry) {
    const td = document.createElement('td');
    const input = document.createElement('input');
    input.classList.add('description');
    input.type = 'text';
    // console.log(entry);
    input.placeholder = 'Description';
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

// Delete and Drag

function createDeleteCell(index, entries) {
    const td = document.createElement('td');
    const deleteBtn = document.createElement('button');
    td.classList.add('actions');
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

function createDragHandleCell() {
    const td = document.createElement('td');
    const handle = document.createElement('span');
    td.classList.add('actions');
    handle.classList.add('action', 'drag-handle');
    handle.textContent = '☰';
    handle.title = 'Drag to reorder';
    handle.style.cursor = 'grab';
    td.appendChild(handle);
    return td;
}

function initSmoothRowDnD(tbody, entries) {
    const scrollContainer = tbody.parentElement; // the scrollable wrapper

    // helper to get current entry rows (not gap rows)
    const getEntryRows = () => [...tbody.querySelectorAll('tr:not(.gap-row)')];

    getEntryRows().forEach((tr) => {
        const handle = tr.querySelector('.drag-handle');
        if (!handle) return;

        let startY, startX, startIndex;
        let dragEl = null;
        let placeholder = null;
        let draggingRow = null;
        let rafId = null;

        const onPointerMove = (e) => {
            if (!dragEl) return;
            const dy = e.clientY - startY;
            const dx = e.clientX - startX;
            dragEl.style.transform = `translate(${dx}px, ${dy}px)`;
            maybeAutoScroll(e);
            movePlaceholder(e.clientY);
        };

        const onPointerUp = (/*e*/) => {
            if (!dragEl) return;

            // compute final index as index of placeholder among entry rows
            const nonGapRows = getEntryRows();
            const finalIndex = nonGapRows.indexOf(placeholder);

            cleanup();

            if (finalIndex !== -1 && finalIndex !== startIndex) {
                const item = entries.splice(startIndex, 1)[0];
                entries.splice(finalIndex, 0, item);
                saveState();
                renderAll();
            } else {
                // unchanged -> just re-render to restore UI/gaps
                renderAll();
            }
        };

        const onPointerDown = (e) => {
            // only primary button
            if (e.button !== 0) return;
            e.preventDefault();

            draggingRow = tr;
            // compute start index among current entry rows
            startIndex = getEntryRows().indexOf(tr);

            const rect = tr.getBoundingClientRect();
            startY = e.clientY;
            startX = e.clientX;

            // create floating clone
            dragEl = tr.cloneNode(true);
            dragEl.style.position = 'fixed';
            dragEl.style.left = rect.left + 'px';
            dragEl.style.top = rect.top + 'px';
            dragEl.style.width = rect.width + 'px';
            dragEl.style.pointerEvents = 'none';
            dragEl.style.zIndex = 9999;
            dragEl.style.transform = 'translate(0,0)';
            dragEl.style.boxShadow = '0 8px 24px rgba(0,0,0,.18)';
            dragEl.style.borderRadius = '6px';
            dragEl.style.opacity = '0.98';
            dragEl.style.willChange = 'transform';
            dragEl.classList.add('drag-floating');
            document.body.appendChild(dragEl);

            // create placeholder row with same height and same number of cells
            placeholder = document.createElement('tr');
            placeholder.className = 'drag-placeholder';
            placeholder.style.height = rect.height + 'px';
            const colCount = tr.children.length;
            for (let c = 0; c < colCount; c++) {
                placeholder.appendChild(document.createElement('td'));
            }

            // insert placeholder where the row was, then remove the real row
            tbody.insertBefore(placeholder, tr);
            tbody.removeChild(tr);

            // global listeners
            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp, {once: true});
        };

        handle.addEventListener('pointerdown', onPointerDown);

        function cleanup() {
            // stop autoscroll RAF if any
            cancelAnimationFrame(rafId);

            // remove floating clone
            if (dragEl && dragEl.parentNode) dragEl.parentNode.removeChild(dragEl);
            dragEl = null;

            // restore the original row before removing placeholder
            if (placeholder && placeholder.parentNode) {
                placeholder.parentNode.insertBefore(draggingRow, placeholder);
                placeholder.parentNode.removeChild(placeholder);
            }
            placeholder = null;

            // clear references
            draggingRow = null;

            // remove pointermove if still attached (safe)
            document.removeEventListener('pointermove', onPointerMove);
        }

        function movePlaceholder(pointerClientY) {
            const entryRows = getEntryRows().filter(r => r !== draggingRow);

            // take BEFORE positions
            const firstRects = new Map(entryRows.map(r => [r, r.getBoundingClientRect()]));

            let target = null;
            for (const r of entryRows) {
                const rrect = r.getBoundingClientRect();
                const midpoint = rrect.top + rrect.height / 2;
                if (pointerClientY < midpoint) {
                    target = r;
                    break;
                }
            }

            if (target) {
                if (placeholder.nextSibling !== target) {
                    tbody.insertBefore(placeholder, target);
                }
            } else {
                if (placeholder !== tbody.lastElementChild) {
                    tbody.appendChild(placeholder);
                }
            }

            // take AFTER positions
            const lastRects = new Map(entryRows.map(r => [r, r.getBoundingClientRect()]));

            animateReorder(entryRows, firstRects, lastRects);
        }

        function maybeAutoScroll(e) {
            const containerRect = scrollContainer.getBoundingClientRect();
            const threshold = 36;
            const maxStep = 18;
            let delta = 0;
            if (e.clientY < containerRect.top + threshold) {
                delta = -maxStep * ((containerRect.top + threshold - e.clientY) / threshold);
            } else if (e.clientY > containerRect.bottom - threshold) {
                delta = maxStep * ((e.clientY - (containerRect.bottom - threshold)) / threshold);
            }

            if (delta !== 0) {
                cancelAnimationFrame(rafId);
                const tick = () => {
                    scrollContainer.scrollTop += delta;
                    rafId = requestAnimationFrame(tick);
                };
                rafId = requestAnimationFrame(tick);
            } else {
                cancelAnimationFrame(rafId);
            }
        }

        function animateReorder(rows, firstRects, lastRects) {
            rows.forEach(r => {
                const first = firstRects.get(r);
                const last = lastRects.get(r);
                if (!first || !last) return;

                const dx = first.left - last.left;
                const dy = first.top - last.top;

                if (dx || dy) {
                    r.style.transform = `translate(${dx}px, ${dy}px)`;
                    r.style.transition = 'none';
                    r.offsetHeight; // force reflow
                    r.style.transform = '';
                    r.style.transition = 'transform 150ms ease';
                }
            });
        }
    });
}

// Gap Row

function createGapRow(minutes, isOverlap = false) {
    const tr = document.createElement('tr');
    tr.classList.add('gap-row');
    tr.appendChild(document.createElement('td'));
    tr.appendChild(document.createElement('td'));

    const desc = document.createElement('td');
    const descInput = document.createElement('input');
    desc.colSpan = 5;
    descInput.type = 'text';
    descInput.value = `${formatMinutes(minutes)} ${isOverlap ? 'overlap' : 'gap'}`;
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