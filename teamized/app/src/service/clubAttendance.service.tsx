/**
 * Utils for the club attendance features
 */

import $ from 'jquery';
import React from 'react';

import * as ClubAttendanceAPI from '@/teamized/api/clubAttendance';
import { CacheCategory } from '@/teamized/interfaces/cache/cacheCategory';
import {
    ClubAttendanceEvent,
    ClubAttendanceEventRequestDTO,
} from '@/teamized/interfaces/club/clubAttendanceEvent';
import { ClubAttendanceEventParticipation } from '@/teamized/interfaces/club/clubAttendanceEventParticipation';
import { ID } from '@/teamized/interfaces/common';
import { Team } from '@/teamized/interfaces/teams/team';
import { confirmAlert, fireAlert, Swal } from '@/teamized/utils/alerts';
import { isoFormat, localInputFormat } from '@/teamized/utils/datetime';

import * as CacheService from './cache.service';

// Attendance events

export async function getAttendanceEvents(teamId: ID) {
    return await CacheService.refreshTeamCacheCategory(
        teamId,
        CacheCategory.CLUB_ATTENDANCE_EVENTS
    );
}

export async function createAttendanceEvent(
    teamId: ID,
    event: ClubAttendanceEventRequestDTO
) {
    return await ClubAttendanceAPI.createClubAttendanceEvent(
        teamId,
        event
    ).then((data) => {
        CacheService.getTeamData(teamId).club_attendance_events[
            data.attendance_event.id
        ] = data.attendance_event;
        return data.attendance_event;
    });
}

export async function createAttendanceEventPopup(team: Team) {
    return await fireAlert<ClubAttendanceEvent>({
        title: 'Anwesenheitsevent erstellen',
        html: (
            <>
                <label className="swal2-input-label" htmlFor="swal-input-title">
                    Titel:
                </label>
                <input
                    type="text"
                    id="swal-input-title"
                    className="swal2-input"
                    placeholder="Event-Titel"
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-description"
                >
                    Beschreibung:
                </label>
                <textarea
                    id="swal-input-description"
                    className="swal2-textarea"
                    placeholder="Event-Beschreibung"
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-dt_start"
                >
                    Startzeitpunkt:
                </label>
                <input
                    type="datetime-local"
                    id="swal-input-dt_start"
                    className="swal2-input"
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-dt_end"
                >
                    Endzeitpunkt:
                </label>
                <input
                    type="datetime-local"
                    id="swal-input-dt_end"
                    className="swal2-input"
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-points"
                >
                    Punkte:
                </label>
                <input
                    type="number"
                    id="swal-input-points"
                    className="swal2-input"
                    defaultValue={1}
                    min={0}
                    step={1}
                />
                <label
                    className="swal2-checkbox tw:flex"
                    htmlFor="swal-input-participating_by_default"
                >
                    <input
                        type="checkbox"
                        id="swal-input-participating_by_default"
                        defaultChecked
                    />
                    <span>Standardmäßig teilnehmend?</span>
                </label>
            </>
        ),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Erstellen',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const title = $('#swal-input-title').val() as string;
            const description = $('#swal-input-description').val() as string;
            const dt_start = $('#swal-input-dt_start').val() as string;
            const dt_end = $('#swal-input-dt_end').val() as string;
            const points = Number($('#swal-input-points').val());
            const participating_by_default = $(
                '#swal-input-participating_by_default'
            ).prop('checked') as boolean;

            if (!title || !dt_start || !dt_end) {
                Swal.showValidationMessage(
                    'Bitte fülle alle Pflichtfelder aus!'
                );
                return false;
            }

            Swal.showLoading();
            return await createAttendanceEvent(team.id, {
                title,
                description,
                dt_start: isoFormat(dt_start),
                dt_end: isoFormat(dt_end),
                points,
                participating_by_default,
                locked: false,
            });
        },
    });
}

export async function editAttendanceEvent(
    teamId: ID,
    eventId: ID,
    event: Partial<ClubAttendanceEventRequestDTO>
) {
    return await ClubAttendanceAPI.updateClubAttendanceEvent(
        teamId,
        eventId,
        event
    ).then((data) => {
        CacheService.getTeamData(teamId).club_attendance_events[
            data.attendance_event.id
        ] = data.attendance_event;
        return data.attendance_event;
    });
}

export async function editAttendanceEventPopup(
    team: Team,
    event: ClubAttendanceEvent
) {
    const dt_start = localInputFormat(event.dt_start);
    const dt_end = localInputFormat(event.dt_end);

    return await fireAlert<ClubAttendanceEvent>({
        title: 'Anwesenheitsevent bearbeiten',
        html: (
            <>
                <label className="swal2-input-label" htmlFor="swal-input-title">
                    Titel:
                </label>
                <input
                    type="text"
                    id="swal-input-title"
                    className="swal2-input"
                    placeholder={event.title}
                    defaultValue={event.title}
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-description"
                >
                    Beschreibung:
                </label>
                <textarea
                    id="swal-input-description"
                    className="swal2-textarea"
                    placeholder={event.description ?? ''}
                    defaultValue={event.description ?? ''}
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-dt_start"
                >
                    Startzeitpunkt:
                </label>
                <input
                    type="datetime-local"
                    id="swal-input-dt_start"
                    className="swal2-input"
                    defaultValue={dt_start}
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-dt_end"
                >
                    Endzeitpunkt:
                </label>
                <input
                    type="datetime-local"
                    id="swal-input-dt_end"
                    className="swal2-input"
                    defaultValue={dt_end}
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-points"
                >
                    Punkte:
                </label>
                <input
                    type="number"
                    id="swal-input-points"
                    className="swal2-input"
                    defaultValue={event.points}
                    min={0}
                    step={1}
                />
                <label
                    className="swal2-checkbox tw:flex"
                    htmlFor="swal-input-participating_by_default"
                >
                    <input
                        type="checkbox"
                        id="swal-input-participating_by_default"
                        defaultChecked={event.participating_by_default}
                    />
                    <span>Standardmäßig teilnehmend?</span>
                </label>
                <label
                    className="swal2-checkbox tw:flex"
                    htmlFor="swal-input-locked"
                >
                    <input
                        type="checkbox"
                        id="swal-input-locked"
                        defaultChecked={event.locked}
                    />
                    <span>Gesperrt?</span>
                </label>
            </>
        ),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Speichern',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const title = $('#swal-input-title').val() as string;
            const description = $('#swal-input-description').val() as string;
            const dt_start = $('#swal-input-dt_start').val() as string;
            const dt_end = $('#swal-input-dt_end').val() as string;
            const points = Number($('#swal-input-points').val());
            const participating_by_default = $(
                '#swal-input-participating_by_default'
            ).prop('checked') as boolean;
            const locked = $('#swal-input-locked').prop('checked') as boolean;

            if (!title || !dt_start || !dt_end) {
                Swal.showValidationMessage(
                    'Bitte fülle alle Pflichtfelder aus!'
                );
                return false;
            }

            Swal.showLoading();
            return await editAttendanceEvent(team.id, event.id, {
                title,
                description,
                dt_start: isoFormat(dt_start),
                dt_end: isoFormat(dt_end),
                points,
                participating_by_default,
                locked,
            });
        },
    });
}

export async function deleteAttendanceEvent(teamId: ID, eventId: ID) {
    return await ClubAttendanceAPI.deleteClubAttendanceEvent(
        teamId,
        eventId
    ).then(() => {
        delete CacheService.getTeamData(teamId).club_attendance_events[eventId];
    });
}

export async function deleteAttendanceEventPopup(
    team: Team,
    event: ClubAttendanceEvent
) {
    return await confirmAlert(
        <>
            Willst du das Anwesenheitsevent <b>{event.title}</b> wirklich
            löschen?
        </>,
        async () => await deleteAttendanceEvent(team.id, event.id)
    );
}

// Participations

export async function getClubAttendanceEventParticipations(
    teamId: ID,
    eventId: ID
) {
    return await ClubAttendanceAPI.getClubAttendanceEventParticipations(
        teamId,
        eventId
    ).then((data) => data.participations);
}

export async function bulkCreateClubAttendanceEventParticipations(
    teamId: ID,
    eventId: ID,
    memberIds: ID[]
) {
    return await ClubAttendanceAPI.bulkCreateClubAttendanceEventParticipations(
        teamId,
        eventId,
        memberIds
    ).then((data) => {
        return data.participations;
    });
}

export async function updateClubAttendanceEventParticipation(
    teamId: ID,
    eventId: ID,
    participationId: ID,
    participation: Partial<ClubAttendanceEventParticipation>
) {
    return await ClubAttendanceAPI.updateClubAttendanceEventParticipation(
        teamId,
        eventId,
        participationId,
        participation
    ).then((data) => {
        return data.participation;
    });
}

export async function deleteClubAttendanceEventParticipation(
    teamId: ID,
    eventId: ID,
    participationId: ID
) {
    return await ClubAttendanceAPI.deleteClubAttendanceEventParticipation(
        teamId,
        eventId,
        participationId
    ).then(() => {
        return null;
    });
}

export async function deleteClubAttendanceEventParticipationPopup(
    team: Team,
    event: ClubAttendanceEvent,
    participation: ClubAttendanceEventParticipation
) {
    return await confirmAlert(
        'Willst du die Teilnahme wirklich löschen?',
        async () =>
            await deleteClubAttendanceEventParticipation(
                team.id,
                event.id,
                participation.id
            )
    );
}
