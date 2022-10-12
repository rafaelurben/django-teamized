import { isInRange, roundDays, getDateString } from './datetime.js';

export function filterByDateRange(sessions, start, end) {
    let result = sessions.filter(session => {
        return isInRange(new Date(session.time_start), start, end) && isInRange(new Date(session.time_end), start, end);
    });
    return result;
}

function splitMultiDaySessions(sessions) {
    // When a session starts before midnight and ends after midnight, it has to be split into multiple sessions
    let tosplit = [...sessions];
    let result = [];
    while (tosplit.length > 0) {
        var session = tosplit.pop();
        let start = new Date(session.time_start);
        let startDay = roundDays(start);
        let end = new Date(session.time_end);
        let endDay = roundDays(new Date(end-1));
        if (startDay < endDay) {
            // Start and end are on different days
            // Get the midnight after the first day
            let midnight = roundDays(start, 1)
            // Create a new session starting at the start of the session and ending at midnight
            let newSession1 = {
                ...session,
                time_start: start,
                time_end: midnight,
                duration: (midnight - start) / 1000,
            };
            result.push(newSession1);
            // Create a new session starting at midnight and ending at the end of the session
            let newSession2 = {
                ...session,
                time_start: midnight,
                tîme_end: end,
                duration: (end - midnight) / 1000,
            };
            tosplit.push(newSession2);
        } else {
            // Start and end are on the same day or was already split (no action needed)
            result.push(session);
        }
    }
    return result;
}

export function chartDataByDays(sessions, start, end) {
    // Create a dictionary of all days in the range
    const days = {};
    var i = 0;
    while (true) {
        let day = roundDays(start, i++);
        days[day] = {
            name: getDateString(day),
            duration_s: 0,
            duration_h: 0,
            duration_h_string: "0",
        };
        if (day >= roundDays(end)) {
            break;
        }
    }

    // Split sessions that start before midnight and end after midnight
    let splitsessions = splitMultiDaySessions(sessions);
    // Add the duration of each session to the corresponding day
    splitsessions.forEach(session => {
        const day = roundDays(new Date(session.time_start));
        days[day].duration_s += session.duration;
        days[day].duration_h = +(days[day].duration_s / 3600).toFixed(2);
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
