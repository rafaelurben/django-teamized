import { isInRange, roundDays, getDateString } from './calendars.js';

export function filterByDateRange(sessions, start, end) {
    let result = sessions.filter(session => {
        return isInRange(new Date(session.time_start), start, end) || isInRange(new Date(session.time_end), start, end);
    });
    return result;
}

export function chartDataByDays(sessions, start, end) {
    const days = {};
    for (let i = -1; i <= ((end - start) / (1000 * 3600 * 24)) + 1; i++) {
        let day = roundDays(start, i);
        days[day] = {
            name: getDateString(day),
            hours: 0,
        };
    }
    sessions.forEach(session => {
        const day = roundDays(new Date(session.time_start));
        days[day].hours += session.duration / 3600;
    });
    return Object.values(days);
}
