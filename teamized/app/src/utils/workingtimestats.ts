/**
 * Functions used to create charts in the workingtime module
 */

import { getDateString, isInRange, roundDays } from './datetime';
import { Worksession } from '../interfaces/workingtime/worksession';

/**
 * Filter sessions for a given date range
 */
export function filterByDateRange(
    sessions: Worksession[],
    start: Date,
    end: Date
): Worksession[] {
    return sessions.filter(
        (session) =>
            isInRange(new Date(session.time_start), start, end) &&
            isInRange(new Date(session.time_end!), start, end)
    );
}

/**
 * Modify an array of sessions to split sessions that span multiple days into multiple sessions
 */
function splitMultiDaySessions(sessions: Worksession[]): Worksession[] {
    // When a session starts before midnight and ends after midnight, it has to be split into multiple sessions
    let toSplit: Worksession[] = [...sessions];
    let result: Worksession[] = [];
    while (toSplit.length > 0) {
        let session = toSplit.pop()!;
        let start = new Date(session.time_start);
        let startDay = roundDays(start);
        let end = new Date(session.time_end!);
        let endDay = roundDays(new Date(end.getTime() - 1));
        if (startDay < endDay) {
            // Start and end are on different days
            // Get the midnight after the first day
            let midnight = roundDays(start, 1);
            // Create a new session starting at the start of the session and ending at midnight
            let newSession1: Worksession = {
                ...session,
                time_start: start.toISOString(),
                time_end: midnight.toISOString(),
                duration: (midnight.getTime() - start.getTime()) / 1000,
            };
            result.push(newSession1);
            // Create a new session starting at midnight and ending at the end of the session
            let newSession2: Worksession = {
                ...session,
                time_start: midnight.toISOString(),
                time_end: end.toISOString(),
                duration: (end.getTime() - midnight.getTime()) / 1000,
            };
            toSplit.push(newSession2);
        } else {
            // Start and end are on the same day or was already split (no action needed)
            result.push(session);
        }
    }
    return result;
}

/**
 * Generate chart data for a chart split by day
 */
export function chartDataByDays(
    sessions: Worksession[],
    start: Date,
    end: Date
) {
    // Create a dictionary of all days in the range
    const days: {
        [key: number]: { name: string; duration_s: number; duration_h: number };
    } = {};
    let i = 0;
    while (true) {
        let dayObj = roundDays(start, i++);
        let dayTime = dayObj.getTime();
        days[dayTime] = {
            name: getDateString(dayObj),
            duration_s: 0,
            duration_h: 0,
        };
        if (dayTime >= roundDays(new Date(end.getTime() - 1)).getTime()) {
            break;
        }
    }

    // Split sessions that start before midnight and end after midnight
    let splitSessions = splitMultiDaySessions(sessions);
    // Add the duration of each session to the corresponding day
    splitSessions.forEach((session) => {
        const day = roundDays(new Date(session.time_start)).getTime();
        days[day].duration_s += session.duration;
        days[day].duration_h = +(days[day].duration_s / 3600).toFixed(2);
    });
    return Object.values(days);
}

/**
 * Get the total duration of all sessions in a list
 * @returns {Number} duration in seconds
 */
export function totalDuration(sessions: Worksession[]): number {
    let total = 0;
    sessions.forEach((session) => {
        total += session.duration;
    });
    return total;
}
