export const pad = (n) => String(n).padStart(2, '0');

export function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

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

export function fmtHM(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${pad(m)}`;
}

export function findLast(arr, predicate) {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (predicate(arr[i])) return arr[i];
    }
    return null;
}

export function uid() {
    return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function escapeHtml(str) {
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
}
