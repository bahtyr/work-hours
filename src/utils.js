// Identifiers

export function uid() {
    return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// HTML

export function findLast(arr, predicate) {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (predicate(arr[i])) return arr[i];
    }
    return null;
}

// Time

export function timeNow() {
    const d = new Date();
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function parseHM(time) {
    if (!time || !/^\d{2}:\d{2}$/.test(time)) return null;
    const [h, m] = time.split(':').map(Number);
    if (h > 23 || m > 59) return null;
    return h * 60 + m;
}

// Format Time

export const pad = (n) => String(n).padStart(2, '0');

export function formatHM(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${pad(m)}`;
}

export function formatMinutes(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) {
        return `${h}h ${m}m`;
    }
    return `${m}m`;
}

// Format Text

export function formatDayName(dateStr) {
    const [year, monthNum, dayNum] = dateStr.split('-').map(Number);
    const date = new Date(year, monthNum - 1, dayNum);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneDayMs = 1000 * 60 * 60 * 24;
    const daysDiff = Math.round((today - date) / oneDayMs);

    // if (daysDiff === 0) return 'Today';
    // if (daysDiff === 1) return 'Yesterday';

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayFullNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayName = dayNames[date.getDay()];
    const dayFullName = dayFullNames[date.getDay()];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();

    // Today
    if (daysDiff === 0) return `${dayFullName}, ${month} ${day}`;

    // This week
    const startOfWeek = new Date(today);
    const dayIndex = today.getDay() || 7; // convert Sunday (0) -> 7 to consider monday as the first day
    startOfWeek.setDate(today.getDate() - (dayIndex - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    if (date >= startOfWeek) {
        return dayName;
    }

    // Last week
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);

    if (date >= startOfLastWeek) {
        return `Last ${dayName}`;
    }

    // Older dates
    return `${day} ${month}`;
}

export function escapeHtml(str) {
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
}

// Entry

export function findTicketNumber(desc) {
    // const match = desc.match(/\b[a-zA-Z]+-\d+\b/);
    // return match ? match[0] : null;
    if (!desc) return null;
    return desc.match(/\b[a-zA-Z]+-\d+\b/);
}