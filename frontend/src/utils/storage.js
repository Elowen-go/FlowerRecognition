const STORAGE_KEY = 'flower_recognition_history';
const MAX_HISTORY = 10;

export function getHistory() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function addHistory(record) {
    const history = getHistory();
    history.unshift({
        ...record,
        id: Date.now(),
        timestamp: new Date().toISOString()
    });
    if (history.length > MAX_HISTORY) {
        history.length = MAX_HISTORY;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return history;
}

export function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
}
