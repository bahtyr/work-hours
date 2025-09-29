import {stateManager} from "../data";
import {findTicketNumber, formatMinutes, parseHM} from "../utils";
import {elements, locators, types} from "../constants";

elements.toggleSummaryBtn.addEventListener('click', toggleSummary);

export function toggleSummary() {
    renderSummary();
    elements.hoursTable.classList.toggle('hidden');
    elements.summaryTable.classList.toggle('hidden');
}

export function isSummaryDisplayed() {
    return !elements.summaryTable.classList.contains('hidden');
}

export function renderSummary() {
    const grouped = groupAndSortEntries();

    elements.summaryTableBody.innerHTML = "";

    for (const g of grouped) {
        let description = g.key;
        if (g.descs.size > 0) {
            description += " - " + [...g.descs].join(", ");
        }

        const row = elements.summaryRowTemplate.content.cloneNode(true);
        const duration = row.querySelector(locators.fieldDuration);
        const descInput = row.querySelector(locators.fieldDescription);
        const type = row.querySelector(locators.fieldType);

        duration.textContent = formatMinutes(g.minutes);
        type.textContent = types[g.type]?.emoji || "";
        type.classList.add(`type-${g.type}`);
        descInput.value = description;

        elements.summaryTableBody.appendChild(row);
    }
}

function groupAndSortEntries() {
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

    // Sort: first by type, then by key alphabetically
    grouped.sort((a, b) => {
        const orderA = types[a.type].priority ?? 999;
        const orderB = types[b.type].priority ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return a.key.localeCompare(b.key);
    });

    return grouped;
}
