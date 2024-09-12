export function getMoscowTime() {
    const date = new Date();
    const offset = 3 * 60; // Смещение для московского времени (UTC+3)
    const moscowTime = new Date(date.getTime() + offset * 60 * 1000);
    return moscowTime;
}