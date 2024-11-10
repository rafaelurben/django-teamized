/**
 * Functions used in the workingtime module
 */

import $ from 'jquery';

import * as WorkingtimeAPI from '../api/workingtime';
import { CacheCategory } from '../interfaces/cache/cacheCategory';
import { ID } from '../interfaces/common';
import { Team } from '../interfaces/teams/team';
import {
    Worksession,
    WorksessionRequestDTO,
} from '../interfaces/workingtime/worksession';
import {
    confirmAlert,
    successAlert,
    Swal,
    waitingAlert,
} from '../utils/alerts';
import {
    getDateString,
    isInRange,
    isoFormat,
    localInputFormat,
    roundDays,
} from '../utils/datetime';
import * as CacheService from './cache.service';
import * as NavigationService from './navigation.service';

export async function getMyWorkSessionsInTeam(teamId: ID) {
    return await CacheService.refreshTeamCacheCategory<Worksession>(
        teamId,
        CacheCategory.ME_WORKSESSIONS
    );
}

// WorkSession creation

export async function createWorkSession(
    teamId: ID,
    session: WorksessionRequestDTO
) {
    return await WorkingtimeAPI.createWorksession(teamId, session).then(
        (data) => {
            CacheService.getCurrentTeamData().me_worksessions[data.session.id] =
                data.session;
            return data.session;
        }
    );
}

export async function createWorkSessionPopup(team: Team) {
    const _dt = localInputFormat(new Date());
    return (
        await Swal.fire({
            title: `Sitzung erstellen`,
            html: `
            <p>Team: ${team.name}</p><hr />
            <label class="swal2-input-label" for="swal-input-note">Notiz:</label>
            <textarea id="swal-input-note" class="swal2-textarea" placeholder="Notiz"></textarea>
            <label class="swal2-input-label" for="swal-input-dtstart">Von:</label>
            <input type="datetime-local" id="swal-input-dtstart" class="swal2-input" value="${_dt}">
            <label class="swal2-input-label" for="swal-input-dtend">Bis:</label>
            <input type="datetime-local" id="swal-input-dtend" class="swal2-input" value="${_dt}">
        `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Erstellen',
            cancelButtonText: 'Abbrechen',
            preConfirm: async () => {
                const note = (<HTMLInputElement>(
                    document.getElementById('swal-input-note')
                )).value;
                const dtstart = (<HTMLInputElement>(
                    document.getElementById('swal-input-dtstart')
                )).value;
                const dtend = (<HTMLInputElement>(
                    document.getElementById('swal-input-dtend')
                )).value;

                if (!dtstart || !dtend) {
                    Swal.showValidationMessage(
                        'Start- und Endzeit sind Pflichtfelder!'
                    );
                    return false;
                }

                Swal.showLoading();
                return await createWorkSession(team.id, {
                    note,
                    time_start: isoFormat(dtstart),
                    time_end: isoFormat(dtend),
                });
            },
        })
    ).value;
}

// WorkSession edit

export async function editWorkSession(
    teamId: ID,
    sessionId: ID,
    session: WorksessionRequestDTO
) {
    return await WorkingtimeAPI.updateWorksession(
        teamId,
        sessionId,
        session
    ).then(async (data) => {
        CacheService.getCurrentTeamData().me_worksessions[data.session.id] =
            data.session;
        return data.session;
    });
}

export async function editWorkSessionPopup(team: Team, session: Worksession) {
    let dtstart = localInputFormat(session.time_start);
    let dtend =
        session.time_end !== null ? localInputFormat(session.time_end) : '';
    return (
        await Swal.fire({
            title: `Sitzung bearbeiten`,
            html:
                `
            <p>Team: ${team.name}</p><hr />
            <label class="swal2-input-label" for="swal-input-note">Notiz:</label>
            <textarea id="swal-input-note" class="swal2-textarea" placeholder="Notiz">${session.note}</textarea>` +
                (session.is_created_via_tracking
                    ? '<hr><p class="swal2-text mt-3 mb-0 small opacity-50 px-3">Start- und Endzeit können nur bei manuell erfassten Sitzungen geändert werden.</p>'
                    : `
                    <label class="swal2-input-label" for="swal-input-dtstart">Von:</label>
                    <input type="datetime-local" id="swal-input-dtstart" class="swal2-input" value="${dtstart}">
                    <label class="swal2-input-label" for="swal-input-dtend">Bis:</label>
                    <input type="datetime-local" id="swal-input-dtend" class="swal2-input" value="${dtend}">
                    `),
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Speichern',
            cancelButtonText: 'Abbrechen',
            preConfirm: async () => {
                const note = (<HTMLInputElement>(
                    document.getElementById('swal-input-note')
                )).value;

                if (!session.is_created_via_tracking) {
                    dtstart = (<HTMLInputElement>(
                        document.getElementById('swal-input-dtstart')
                    )).value;
                    dtend = (<HTMLInputElement>(
                        document.getElementById('swal-input-dtend')
                    )).value;
                    if (!dtstart || !dtend) {
                        Swal.showValidationMessage(
                            'Start- und Endzeit sind Pflichtfelder!'
                        );
                        return false;
                    }
                }

                Swal.showLoading();
                return await editWorkSession(team.id, session.id, {
                    note,
                    time_start: isoFormat(dtstart),
                    time_end: isoFormat(dtend),
                });
            },
        })
    ).value;
}

// WorkSession deletion

export async function deleteWorkSession(teamId: ID, sessionId: ID) {
    return await WorkingtimeAPI.deleteWorksession(teamId, sessionId).then(
        () => {
            delete CacheService.getCurrentTeamData().me_worksessions[sessionId];
        }
    );
}

export async function deleteWorkSessionPopup(team: Team, session: Worksession) {
    await confirmAlert(
        'Willst du folgende Sitzung wirklich löschen?<br /><br />' +
            `<b>Notiz:</b> ${session.note}`,
        async () => await deleteWorkSession(team.id, session.id)
    );
}

// Tracking

export async function startTrackingSession(teamId: ID) {
    waitingAlert('Wird gestartet...');
    return await WorkingtimeAPI.startTrackingSession(teamId).then((data) => {
        successAlert('Die Zeitmessung wurde gestartet', 'Tracking gestartet');
        window.appdata.current_worksession = data.session;
        return data.session;
    });
}

export async function getTrackingSession() {
    return await WorkingtimeAPI.getTrackingSession().then((data) => {
        if (data.error) {
            // 'no_active_tracking_session_exists' comes with a 200 code on purpose
            window.appdata.current_worksession = null;
            return null;
        } else {
            window.appdata.current_worksession = data.session;
            NavigationService.renderPage();
            return data.session;
        }
    });
}

export async function stopTrackingSession() {
    waitingAlert('Wird gestoppt...');
    return await WorkingtimeAPI.stopTrackingSession().then((data) => {
        successAlert('Die Zeitmessung wurde gestoppt', 'Tracking gestoppt');
        window.appdata.current_worksession = null;
        CacheService.getTeamData(data.session._team_id).me_worksessions[
            data.session.id
        ] = data.session;
        return data.session;
    });
}

// Rename session without the date options/text

export async function renameWorkSession(
    teamId: ID,
    sessionId: ID,
    note: string
) {
    return await WorkingtimeAPI.updateWorksession(teamId, sessionId, {
        note,
    }).then((data) => {
        if (
            data.session.id in CacheService.getCurrentTeamData().me_worksessions
        ) {
            CacheService.getCurrentTeamData().me_worksessions[data.session.id] =
                data.session;
        }
        if (
            window.appdata.current_worksession &&
            window.appdata.current_worksession.id === data.session.id
        ) {
            window.appdata.current_worksession = data.session;
        }
        return data.session;
    });
}

export async function renameWorkSessionPopup(team: Team, session: Worksession) {
    return (
        await Swal.fire({
            title: `Sitzung umbenennen`,
            html: `<textarea id="swal-input-note" class="swal2-textarea" placeholder="Notiz">${session.note}</textarea>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Speichern',
            cancelButtonText: 'Abbrechen',
            preConfirm: async () => {
                const note = <string>$('#swal-input-note').val();

                Swal.showLoading();
                return await renameWorkSession(team.id, session.id, note);
            },
        })
    ).value;
}

// Workingtime stats utils

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
    const toSplit: Worksession[] = [...sessions];
    const result: Worksession[] = [];
    while (toSplit.length > 0) {
        const session = toSplit.pop()!;
        const start = new Date(session.time_start);
        const startDay = roundDays(start);
        const end = new Date(session.time_end!);
        const endDay = roundDays(new Date(end.getTime() - 1));
        if (startDay < endDay) {
            // Start and end are on different days
            // Get the midnight after the first day
            const midnight = roundDays(start, 1);
            // Create a new session starting at the start of the session and ending at midnight
            const newSession1: Worksession = {
                ...session,
                time_start: start.toISOString(),
                time_end: midnight.toISOString(),
                duration: (midnight.getTime() - start.getTime()) / 1000,
            };
            result.push(newSession1);
            // Create a new session starting at midnight and ending at the end of the session
            const newSession2: Worksession = {
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
    let dayTime: number;
    do {
        const dayObj = roundDays(start, i++);
        dayTime = dayObj.getTime();
        days[dayTime] = {
            name: getDateString(dayObj),
            duration_s: 0,
            duration_h: 0,
        };
    } while (dayTime < roundDays(new Date(end.getTime() - 1)).getTime());

    // Split sessions that start before midnight and end after midnight
    const splitSessions = splitMultiDaySessions(sessions);
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
