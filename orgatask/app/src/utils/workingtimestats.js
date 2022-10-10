import { isInRange, roundDays, getDateString } from './calendars.js';

export function filterByDateRange(sessions, start, end) {
    let result = sessions.filter(session => {
        return isInRange(new Date(session.time_start), start, end) && isInRange(new Date(session.time_end), start, end);
    });
    return result;
}

export function chartDataByDays(sessions, start, end) {
    const days = {};
    var i = 0;
    while (true) {
        let day = roundDays(start, i++);
        days[day] = {
            name: getDateString(day),
            duration_s: 0,
            duration_h: "0",
        };
        if (day >= roundDays(end)) {
            break;
        }
    }
    sessions.forEach(session => {
        const day = roundDays(new Date(session.time_start));
        days[day].duration_s += session.duration;
        days[day].duration_h = (days[day].duration_s / 3600).toFixed(2);
    });
    return Object.values(days);
}

export function totalDuration(sessions) {
    let total = 0;
    sessions.forEach(session => {
        total += session.duration;
    });
    return total;
}
