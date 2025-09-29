import {constants, locators, types} from '../constants';
import {formatMinutes, identifyTicketType, parseHM, roundHM} from '../utils';
import {stateManager} from "../data";
import {updateDayTotal} from "./render_day_summary";
import {renderAll} from "./controller";

const gapRows = new Map();

// --------- Hours Table //

export function renderHoursTable() {
    const entries = stateManager.getEntries();
    const tbody = constants.hoursTableBody;
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
            stateManager.moveEntry(from, to);
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
    tr.appendChild(createDeleteCell(index));
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
    input.dataset.field = field;

    input.onblur = () => {
        if (input.value) {
            input.value = roundHM(input.value);
            update(input.value);
        }
    };

    input.oninput = () => {
        update(input.value);
    };

    function update(newValue) {
        let initialValue = entry[field];

        const entries = stateManager.getEntries();
        const index = entries.indexOf(entry);

        // --- SNAP LOGIC ---
        // update next entry’s input as well
        if (field === "end" && index < entries.length - 1) {
            const next = entries[index + 1];
            if (next.start === initialValue) {
                const nextCell = document.querySelector(`tr[data-entry-id="${next.id}"] input[data-field="start"]`);
                nextCell.value = newValue;
                stateManager.updateEntry(next.id, {start: newValue});
            }
        }

        // update previous entry’s input as well
        if (field === "start" && index > 0) {
            const prev = entries[index - 1];
            if (prev.end === initialValue) {
                const prevCell = document.querySelector(`tr[data-entry-id="${prev.id}"] input[data-field="end"]`);
                if (prevCell) {
                    prevCell.value = newValue;
                    stateManager.updateEntry(prev.id, {end: newValue});
                }
            }
        }

        // save the entry and update
        stateManager.updateEntry(entry.id, {[field]: newValue});
        updateDayTotal();

        // update gaps
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
        stateManager.updateEntry(entry.id, {type: (entry.type + 1) % types.length});
        btn.textContent = types[entry.type].emoji;
        btn.classList.add('type-' + entry.type);
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
        // identify entry type based on description
        const identifiedType = identifyTicketType(input.value);
        // update entry type and row icon
        const row = input.closest('tr');
        const btn = row.querySelector(locators.entryTypeBtn);
        btn.textContent = types[identifiedType].emoji;
        stateManager.updateEntry(entry.id, {desc: input.value, type: identifiedType});
        updateDayTotal();
    };
    input.addEventListener('keydown', e => {
        if ((e.key === 'Backspace' || e.key === 'Delete') && input.value === '') {
            const row = input.closest('tr');
            const btn = row.querySelector(locators.entryDeleteBtn);
            btn.click();
        }
    });
    td.appendChild(input);
    return td;
}

// Delete and Drag

function createDeleteCell(index) {
    const td = document.createElement('td');
    const deleteBtn = document.createElement('button');
    td.classList.add('actions');
    deleteBtn.classList.add('action', 'delete');
    deleteBtn.textContent = 'x';
    deleteBtn.onclick = () => {
        if (confirm('Delete this entry?')) {
            stateManager.deleteEntry(index);
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
                stateManager.moveEntry(startIndex, finalIndex);
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
    descInput.type = 'text';
    descInput.value = `${formatMinutes(minutes)} ${isOverlap ? 'overlap' : 'gap'}`;
    descInput.readOnly = true;
    descInput.classList.add('description');
    desc.appendChild(descInput);
    tr.appendChild(desc);
    tr.appendChild(document.createElement('td'));
    tr.appendChild(document.createElement('td'));
    tr.appendChild(document.createElement('td'));
    tr.appendChild(document.createElement('td'));
    return tr;
}

function updateGapAfter(prevEntry) {
    const entries = stateManager.getEntries();
    const tbody = constants.hoursTableBody;
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