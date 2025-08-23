
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
    const today = new Date();
    const date = new Date(dateStr);

    // Normalize time for accurate day difference
    const oneDayMs = 1000 * 60 * 60 * 24;
    const daysDiff = Math.floor((today - date) / oneDayMs);

    // if (daysDiff === 0) return 'Today';
    // if (daysDiff === 1) return 'Yesterday';

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayFullNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayName = dayNames[date.getDay()];
    const dayFullName = dayFullNames[date.getDay()];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();

    // Today
    if (daysDiff === 0) return `${month}, ${dayFullName} ${day}`;

    // This week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    if (date >= startOfWeek) {
        return dayName; // just the day name
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
