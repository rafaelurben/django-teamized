/**
 * Functions used in the workingtime module
 */

import $ from 'jquery';
import React from 'react';

import * as WorkingtimeAPI from '@/teamized/api/workingtime';
import { CacheCategory } from '@/teamized/interfaces/cache/cacheCategory';
import { ID } from '@/teamized/interfaces/common';
import { Team } from '@/teamized/interfaces/teams/team';
import {
    Worksession,
    WorksessionRequestDTO,
} from '@/teamized/interfaces/workingtime/worksession';
import {
    confirmAlert,
    fireAlert,
    successToast,
    Swal,
    waitingToast,
} from '@/teamized/utils/alerts';
import {
    formatDate,
    getDateString,
    isInRange,
    isoFormat,
    localInputFormat,
    roundDays,
    roundMonths,
    roundWeeks,
    roundYears,
} from '@/teamized/utils/datetime';

import * as CacheService from './cache.service';

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
            CacheService.getTeamData(teamId).me_worksessions[data.session.id] =
                data.session;
            return data.session;
        }
    );
}

export async function createWorkSessionPopup(team: Team) {
    const _dt = localInputFormat(new Date());
    return await fireAlert<Worksession>({
        title: `Sitzung erstellen`,
        html: (
            <>
                <p>Team: {team.name}</p>
                <hr className="tw:my-2" />
                <label className="swal2-input-label" htmlFor="swal-input-note">
                    Notiz:
                </label>
                <textarea
                    id="swal-input-note"
                    className="swal2-textarea"
                    placeholder="Notiz"
                    defaultValue={''}
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-unit_count"
                >
                    Einheiten (optional):
                </label>
                <input
                    type="number"
                    min={0}
                    id="swal-input-unit_count"
                    className="swal2-input"
                    defaultValue={''}
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-dtstart"
                >
                    Von:
                </label>
                <input
                    type="datetime-local"
                    id="swal-input-dtstart"
                    className="swal2-input"
                    defaultValue={_dt}
                />
                <label className="swal2-input-label" htmlFor="swal-input-dtend">
                    Bis:
                </label>
                <input
                    type="datetime-local"
                    id="swal-input-dtend"
                    className="swal2-input"
                    defaultValue={_dt}
                />
            </>
        ),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Erstellen',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const note = (
                document.getElementById('swal-input-note') as HTMLInputElement
            ).value;
            const unit_count = (
                document.getElementById(
                    'swal-input-unit_count'
                ) as HTMLInputElement
            ).valueAsNumber;

            const dtstart = (
                document.getElementById(
                    'swal-input-dtstart'
                ) as HTMLInputElement
            ).value;
            const dtend = (
                document.getElementById('swal-input-dtend') as HTMLInputElement
            ).value;

            if (!dtstart || !dtend) {
                Swal.showValidationMessage(
                    'Start- und Endzeit sind Pflichtfelder!'
                );
                return false;
            }

            Swal.showLoading();
            return await createWorkSession(team.id, {
                note,
                unit_count: Number.isNaN(unit_count) ? null : unit_count,
                time_start: isoFormat(dtstart),
                time_end: isoFormat(dtend),
            });
        },
    });
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
        CacheService.getTeamData(teamId).me_worksessions[data.session.id] =
            data.session;
        return data.session;
    });
}

export async function editWorkSessionPopup(team: Team, session: Worksession) {
    let dtstart = localInputFormat(session.time_start);
    let dtend =
        session.time_end === null ? '' : localInputFormat(session.time_end);
    return await fireAlert<Worksession>({
        title: `Sitzung bearbeiten`,
        html: (
            <>
                <p>Team: {team.name}</p>
                <hr className="tw:my-2" />
                <label className="swal2-input-label" htmlFor="swal-input-note">
                    Notiz:
                </label>
                <textarea
                    id="swal-input-note"
                    className="swal2-textarea"
                    placeholder="Notiz"
                    defaultValue={session.note}
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-unit_count"
                >
                    Einheiten (optional):
                </label>
                <input
                    type="number"
                    min={0}
                    id="swal-input-unit_count"
                    className="swal2-input"
                    defaultValue={session.unit_count ?? ''}
                />
                {session.is_created_via_tracking ? (
                    <>
                        <hr className="tw:my-2" />
                        <p className="swal2-text tw:text-sm tw:opacity-50">
                            Start- und Endzeit können nur bei manuell erfassten
                            Sitzungen geändert werden.
                        </p>
                    </>
                ) : (
                    <>
                        <label
                            className="swal2-input-label"
                            htmlFor="swal-input-dtstart"
                        >
                            Von:
                        </label>
                        <input
                            type="datetime-local"
                            id="swal-input-dtstart"
                            className="swal2-input"
                            defaultValue={dtstart}
                        />
                        <label
                            className="swal2-input-label"
                            htmlFor="swal-input-dtend"
                        >
                            Bis:
                        </label>
                        <input
                            type="datetime-local"
                            id="swal-input-dtend"
                            className="swal2-input"
                            defaultValue={dtend}
                        />
                    </>
                )}
            </>
        ),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Speichern',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const note = (
                document.getElementById('swal-input-note') as HTMLInputElement
            ).value;
            const unit_count = (
                document.getElementById(
                    'swal-input-unit_count'
                ) as HTMLInputElement
            ).valueAsNumber;

            if (!session.is_created_via_tracking) {
                dtstart = (
                    document.getElementById(
                        'swal-input-dtstart'
                    ) as HTMLInputElement
                ).value;
                dtend = (
                    document.getElementById(
                        'swal-input-dtend'
                    ) as HTMLInputElement
                ).value;
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
                unit_count: Number.isNaN(unit_count) ? null : unit_count,
                time_start: isoFormat(dtstart),
                time_end: isoFormat(dtend),
            });
        },
    });
}

// WorkSession deletion

export async function deleteWorkSession(teamId: ID, sessionId: ID) {
    return await WorkingtimeAPI.deleteWorksession(teamId, sessionId).then(
        () => {
            delete CacheService.getTeamData(teamId).me_worksessions[sessionId];
        }
    );
}

export async function deleteWorkSessionPopup(team: Team, session: Worksession) {
    return await confirmAlert(
        <>
            Willst du folgende Sitzung wirklich löschen?
            <br />
            <br />
            <b>Notiz:</b> {session.note}
        </>,
        async () => await deleteWorkSession(team.id, session.id)
    );
}

// Tracking

export async function startTrackingSession(teamId: ID) {
    return await waitingToast(
        'Wird gestartet...',
        WorkingtimeAPI.startTrackingSession(teamId).then((data) => {
            successToast(
                'Tracking gestartet',
                'Die Zeitmessung wurde gestartet'
            );
            window.appdata.current_worksession = data.session;
            return data.session;
        })
    );
}

export async function getTrackingSession() {
    return await WorkingtimeAPI.getTrackingSession().then((data) => {
        if (data.error) {
            // 'no_active_tracking_session_exists' comes with a 200 code on purpose
            window.appdata.current_worksession = null;
            return null;
        } else {
            window.appdata.current_worksession = data.session;
            return data.session;
        }
    });
}

export async function stopTrackingSession() {
    return await waitingToast(
        'Wird gestoppt...',
        WorkingtimeAPI.stopTrackingSession().then((data) => {
            successToast('Tracking gestoppt', 'Die Zeitmessung wurde gestoppt');
            window.appdata.current_worksession = null;
            CacheService.getTeamData(data.session._team_id).me_worksessions[
                data.session.id
            ] = data.session;
            return data.session;
        })
    );
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
            data.session.id in CacheService.getTeamData(teamId).me_worksessions
        ) {
            CacheService.getTeamData(teamId).me_worksessions[data.session.id] =
                data.session;
        }
        if (window.appdata.current_worksession?.id === data.session.id) {
            window.appdata.current_worksession = data.session;
        }
        return data.session;
    });
}

export async function renameWorkSessionPopup(team: Team, session: Worksession) {
    return await fireAlert<Worksession>({
        title: `Sitzung umbenennen`,
        html: (
            <textarea
                id="swal-input-note"
                className="swal2-textarea"
                placeholder="Notiz"
                defaultValue={session.note}
            />
        ),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Speichern',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const note = $('#swal-input-note').val() as string;

            Swal.showLoading();
            return await renameWorkSession(team.id, session.id, note);
        },
    });
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

interface WorkingtimeChartItem {
    name: string;
    duration_s: number;
    duration_h: number;
    unit_count: number;
}

type WorkingtimeChartData = {
    [key: number]: WorkingtimeChartItem;
};

/**
 * Generate chart data for a chart
 * @param sessions list of worksessions
 * @param start the start of the selected date range
 * @param end the end of the selected date range
 * @param groupFn function to group, round and offset dates
 * @param formatFn function to format the group name
 */
function chartDataBy(
    sessions: Worksession[],
    start: Date,
    end: Date,
    groupFn: (date: Date, offset?: number) => Date,
    formatFn: (date: Date) => string
) {
    // Create a dictionary of all group units in the range
    const groups: WorkingtimeChartData = {};
    const lastGroupTime = groupFn(end).getTime();
    let i = 0;
    let groupDate: Date;
    let groupTime: number;
    do {
        groupDate = groupFn(start, i++);
        groupTime = groupDate.getTime();
        groups[groupTime] = {
            name: formatFn(groupDate),
            duration_s: 0,
            duration_h: 0,
            unit_count: 0,
        };
    } while (groupTime < lastGroupTime);

    // Split sessions that start before midnight and end after midnight
    const splitSessions = splitMultiDaySessions(sessions);
    // Add the duration and unit count of each session to the corresponding week
    splitSessions.forEach((session) => {
        const day = groupFn(new Date(session.time_start)).getTime();
        groups[day].duration_s += session.duration;
        groups[day].duration_h = +(groups[day].duration_s / 3600).toFixed(2);
        if (session.unit_count != null) {
            groups[day].unit_count += session.unit_count;
        }
    });
    return Object.values(groups);
}

export function chartData(sessions: Worksession[], start: Date, end: Date) {
    const dayDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (dayDiff > 365) {
        // by year
        return chartDataBy(sessions, start, end, roundYears, (date) =>
            formatDate(date, {
                year: 'numeric',
            })
        );
    } else if (dayDiff > 70) {
        // by month
        return chartDataBy(sessions, start, end, roundMonths, (date) =>
            formatDate(date, {
                month: 'long',
                year: 'numeric',
            })
        );
    } else if (dayDiff > 21) {
        // by week
        return chartDataBy(
            sessions,
            start,
            end,
            roundWeeks,
            (date) =>
                formatDate(date, {
                    day: 'numeric',
                    month: 'numeric',
                }) +
                ' - ' +
                formatDate(roundDays(date, 6), {
                    day: 'numeric',
                    month: 'numeric',
                })
        );
    }
    // by date
    return chartDataBy(sessions, start, end, roundDays, getDateString);
}

/**
 * Get the total duration of all sessions in a list
 * @returns {Number} duration in seconds
 */
export function totalDuration(sessions: Worksession[]): number {
    return sessions
        .map((session) => session.duration)
        .reduce((a, b) => a + b, 0);
}

/**
 * Get the total unit count of all sessions in a list
 * @returns {Number} total unit count
 */
export function totalUnitCount(sessions: Worksession[]): number {
    return sessions
        .map((session) => session.unit_count)
        .filter((count) => count != null)
        .reduce((a, b) => a + b, 0);
}
