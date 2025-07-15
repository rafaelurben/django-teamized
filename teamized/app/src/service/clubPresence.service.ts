/**
 * Utils for the club presence features
 */

import $ from 'jquery';

import * as ClubPresenceAPI from '../api/clubPresence';
import { CacheCategory } from '../interfaces/cache/cacheCategory';
import {
    ClubPresenceEvent,
    ClubPresenceEventRequestDTO,
} from '../interfaces/club/clubPresenceEvent';
import { ClubPresenceEventParticipation } from '../interfaces/club/clubPresenceEventParticipation';
import { ID } from '../interfaces/common';
import { Team } from '../interfaces/teams/team';
import { confirmAlert, fireAlert, Swal } from '../utils/alerts';
import { isoFormat, localInputFormat } from '../utils/datetime';
import * as CacheService from './cache.service';

// Presence events

export async function getPresenceEvents(teamId: ID) {
    return await CacheService.refreshTeamCacheCategory(
        teamId,
        CacheCategory.CLUB_PRESENCE_EVENTS
    );
}

export async function createPresenceEvent(
    teamId: ID,
    event: ClubPresenceEventRequestDTO
) {
    return await ClubPresenceAPI.createClubPresenceEvent(teamId, event).then(
        (data) => {
            CacheService.getTeamData(teamId).club_presence_events[
                data.presence_event.id
            ] = data.presence_event;
            return data.presence_event;
        }
    );
}

export async function createPresenceEventPopup(team: Team) {
    return await fireAlert<ClubPresenceEvent>({
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
            const points = <number>$('#swal-input-points').val();
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
            return await createPresenceEvent(team.id, {
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

export async function editPresenceEvent(
    teamId: ID,
    eventId: ID,
    event: Partial<ClubPresenceEventRequestDTO>
) {
    return await ClubPresenceAPI.updateClubPresenceEvent(
        teamId,
        eventId,
        event
    ).then((data) => {
        CacheService.getTeamData(teamId).club_presence_events[
            data.presence_event.id
        ] = data.presence_event;
        return data.presence_event;
    });
}

export async function editPresenceEventPopup(
    team: Team,
    event: ClubPresenceEvent
) {
    const dt_start = localInputFormat(event.dt_start);
    const dt_end = localInputFormat(event.dt_end);

    return await fireAlert<ClubPresenceEvent>({
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
            return await editPresenceEvent(team.id, event.id, {
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

export async function deletePresenceEvent(teamId: ID, eventId: ID) {
    return await ClubPresenceAPI.deleteClubPresenceEvent(teamId, eventId).then(
        () => {
            delete CacheService.getTeamData(teamId).club_presence_events[
                eventId
            ];
        }
    );
}

export async function deletePresenceEventPopup(
    team: Team,
    event: ClubPresenceEvent
) {
    return await confirmAlert(
        `Willst du das Anwesenheitsevent '<b>${event.title}</b>' wirklich löschen?`,
        async () => await deletePresenceEvent(team.id, event.id)
    );
}

// Participations

export async function getClubPresenceEventParticipations(
    teamId: ID,
    eventId: ID
) {
    return await ClubPresenceAPI.getClubPresenceEventParticipations(
        teamId,
        eventId
    ).then((data) => data.participations);
}

export async function bulkCreateClubPresenceEventParticipations(
    teamId: ID,
    eventId: ID,
    memberIds: ID[]
) {
    return await ClubPresenceAPI.bulkCreateClubPresenceEventParticipations(
        teamId,
        eventId,
        memberIds
    ).then((data) => {
        return data.participations;
    });
}

export async function deleteClubPresenceEventParticipation(
    teamId: ID,
    eventId: ID,
    participationId: ID
) {
    return await ClubPresenceAPI.deleteClubPresenceEventParticipation(
        teamId,
        eventId,
        participationId
    ).then(() => {
        return null;
    });
}

export async function deleteClubPresenceEventParticipationPopup(
    team: Team,
    event: ClubPresenceEvent,
    participation: ClubPresenceEventParticipation
) {
    return await confirmAlert(
        'Willst du die Teilnahme wirklich löschen?',
        async () =>
            await deleteClubPresenceEventParticipation(
                team.id,
                event.id,
                participation.id
            )
    );
}
