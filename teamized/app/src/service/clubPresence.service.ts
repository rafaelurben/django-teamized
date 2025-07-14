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
import { ID } from '../interfaces/common';
import { Team } from '../interfaces/teams/team';
import { fireAlert, Swal } from '../utils/alerts';
import { isoFormat } from '../utils/datetime';
import * as CacheService from './cache.service';

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
            <input type="number" id="swal-input-points" class="swal2-input" value="1" min="0">
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
