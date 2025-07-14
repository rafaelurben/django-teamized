/**
 * Teamized Club Presence API
 */

import {
    ClubPresenceEvent,
    ClubPresenceEventRequestDTO,
} from '../interfaces/club/clubPresenceEvent';
import {
    ClubPresenceEventParticipation,
    ClubPresenceEventParticipationRequestDTO,
} from '../interfaces/club/clubPresenceEventParticipation';
import { ID } from '../interfaces/common';
import { API } from './_base';

export async function getClubPresenceEvents(teamId: ID) {
    return await API.get<{ presence_events: ClubPresenceEvent[] }>(
        `teams/${teamId}/club/presence-events`
    );
}

export async function createClubPresenceEvent(
    teamId: ID,
    event: ClubPresenceEventRequestDTO
) {
    return await API.post<{ presence_event: ClubPresenceEvent }>(
        `teams/${teamId}/club/presence-events`,
        event
    );
}

export async function updateClubPresenceEvent(
    teamId: ID,
    eventId: ID,
    event: Partial<ClubPresenceEventRequestDTO>
) {
    return await API.put<{ presence_event: ClubPresenceEvent }>(
        `teams/${teamId}/club/presence-events/${eventId}`,
        event
    );
}

export async function deleteClubPresenceEvent(teamId: ID, eventId: ID) {
    return await API.delete(`teams/${teamId}/club/presence-events/${eventId}`);
}

export async function getClubPresenceEventParticipations(
    teamId: ID,
    eventId: ID
) {
    return await API.get<{ participations: ClubPresenceEventParticipation[] }>(
        `teams/${teamId}/club/presence-events/${eventId}/participations`
    );
}

export async function bulkCreateClubPresenceEventParticipations(
    teamId: ID,
    eventId: ID,
    member_ids: ID[]
) {
    return await API.post<{
        participations: ClubPresenceEventParticipation[];
    }>(
        `teams/${teamId}/club/presence-events/${eventId}/participations/bulk-create`,
        { member_ids }
    );
}

export async function updateClubPresenceEventParticipation(
    teamId: ID,
    eventId: ID,
    participationId: ID,
    participation: Partial<ClubPresenceEventParticipationRequestDTO>
) {
    return await API.put<{
        participation: ClubPresenceEventParticipation;
    }>(
        `teams/${teamId}/club/presence-events/${eventId}/participations/${participationId}`,
        participation
    );
}

export async function deleteClubPresenceEventParticipation(
    teamId: ID,
    eventId: ID,
    participationId: ID
) {
    return await API.delete(
        `teams/${teamId}/club/presence-events/${eventId}/participations/${participationId}`
    );
}
