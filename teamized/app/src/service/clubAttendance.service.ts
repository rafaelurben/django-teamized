/**
 * Utils for the club attendance features
 */

import $ from 'jquery';

import * as ClubAttendanceAPI from '../api/clubAttendance';
import { CacheCategory } from '../interfaces/cache/cacheCategory';
import {
    ClubAttendanceEvent,
    ClubAttendanceEventRequestDTO,
} from '../interfaces/club/clubAttendanceEvent';
import { ClubAttendanceEventParticipation } from '../interfaces/club/clubAttendanceEventParticipation';
import { ID } from '../interfaces/common';
import { Team } from '../interfaces/teams/team';
import { confirmAlert, fireAlert, Swal } from '../utils/alerts';
import { isoFormat, localInputFormat } from '../utils/datetime';
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
        html: `
            <label class="swal2-input-label" for="swal-input-title">Titel:</label>
            <input type="text" id="swal-input-title" class="swal2-input" placeholder="Event-Titel">
            <label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>
            <textarea id="swal-input-description" class="swal2-textarea" placeholder="Event-Beschreibung"></textarea>
            <label class="swal2-input-label" for="swal-input-dt_start">Startzeitpunkt:</label>
            <input type="datetime-local" id="swal-input-dt_start" class="swal2-input">
            <label class="swal2-input-label" for="swal-input-dt_end">Endzeitpunkt:</label>
            <input type="datetime-local" id="swal-input-dt_end" class="swal2-input">
            <label class="swal2-input-label" for="swal-input-points">Punkte:</label>
            <input type="number" id="swal-input-points" class="swal2-input" value="1" min="0" step="1">
            <label class="swal2-checkbox d-flex" for="swal-input-participating_by_default">
                <input type="checkbox" id="swal-input-participating_by_default" checked>
                <span>Standardmäßig teilnehmend?</span>
            </label>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Erstellen',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const title = <string>$('#swal-input-title').val();
            const description = <string>$('#swal-input-description').val();
            const dt_start = <string>$('#swal-input-dt_start').val();
            const dt_end = <string>$('#swal-input-dt_end').val();
            const points = Number($('#swal-input-points').val());
            const participating_by_default = <boolean>(
                $('#swal-input-participating_by_default').prop('checked')
            );

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
        html: `
            <label class="swal2-input-label" for="swal-input-title">Titel:</label>
            <input type="text" id="swal-input-title" class="swal2-input" placeholder="${event.title}" value="${event.title}">
            <label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>
            <textarea id="swal-input-description" class="swal2-textarea" placeholder="${event.description}">${event.description}</textarea>
            <label class="swal2-input-label" for="swal-input-dt_start">Startzeitpunkt:</label>
            <input type="datetime-local" id="swal-input-dt_start" class="swal2-input" value="${dt_start}">
            <label class="swal2-input-label" for="swal-input-dt_end">Endzeitpunkt:</label>
            <input type="datetime-local" id="swal-input-dt_end" class="swal2-input" value="${dt_end}">
            <label class="swal2-input-label" for="swal-input-points">Punkte:</label>
            <input type="number" id="swal-input-points" class="swal2-input" value="${event.points}" min="0" step="1">
            <label class="swal2-checkbox d-flex" for="swal-input-participating_by_default">
                <input type="checkbox" id="swal-input-participating_by_default" ${event.participating_by_default ? 'checked' : ''}>
                <span>Standardmäßig teilnehmend?</span>
            </label>
            <label class="swal2-checkbox d-flex" for="swal-input-locked">
                <input type="checkbox" id="swal-input-locked" ${event.locked ? 'checked' : ''}>
                <span>Gesperrt?</span>
            </label>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Speichern',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const title = <string>$('#swal-input-title').val();
            const description = <string>$('#swal-input-description').val();
            const dt_start = <string>$('#swal-input-dt_start').val();
            const dt_end = <string>$('#swal-input-dt_end').val();
            const points = <number>$('#swal-input-points').val();
            const participating_by_default = <boolean>(
                $('#swal-input-participating_by_default').prop('checked')
            );
            const locked = <boolean>$('#swal-input-locked').prop('checked');

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
        `Willst du das Anwesenheitsevent '<b>${event.title}</b>' wirklich löschen?`,
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
