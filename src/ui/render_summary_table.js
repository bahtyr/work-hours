import {stateManager} from "../data";
import {findTicketNumber, formatMinutes, parseHM} from "../utils";
import {elements, types} from "../constants";

elements.toggleSummaryBtn.addEventListener('click', toggleSummary);

export function toggleSummary() {
    renderSummary();
    elements.hoursTable.classList.toggle('hidden');
    elements.summary.classList.toggle('hidden');
}

export function isSummaryDisplayed() {
    return !elements.summary.classList.contains('hidden');
}

export function renderSummary() {
    const grouped = []; // will store { type, key, minutes, descs }

    // Count totals for matching entries
    for (const entry of stateManager.getEntries()) {
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
    grouped.sort((a, b) => {
        const orderA = types[a.type].priority ?? 999;
        const orderB = types[b.type].priority ?? 999;
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

