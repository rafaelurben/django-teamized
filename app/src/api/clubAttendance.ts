/**
 * Teamized Club Attendance API
 */

import {
    ClubAttendanceEvent,
    ClubAttendanceEventRequestDTO,
} from '@/teamized/interfaces/club/clubAttendanceEvent';
import {
    ClubAttendanceEventParticipation,
    ClubAttendanceEventParticipationRequestDTO,
} from '@/teamized/interfaces/club/clubAttendanceEventParticipation';
import { ID } from '@/teamized/interfaces/common';

import { API } from './_base';

export async function createClubAttendanceEvent(
    teamId: ID,
    event: ClubAttendanceEventRequestDTO
) {
    return await API.post<{ attendance_event: ClubAttendanceEvent }>(
        `teams/${teamId}/club/attendance_events`,
        event
    );
}

export async function updateClubAttendanceEvent(
    teamId: ID,
    eventId: ID,
    event: Partial<ClubAttendanceEventRequestDTO>
) {
    return await API.put<{ attendance_event: ClubAttendanceEvent }>(
        `teams/${teamId}/club/attendance_events/${eventId}`,
        event
    );
}

export async function deleteClubAttendanceEvent(teamId: ID, eventId: ID) {
    return await API.delete(
        `teams/${teamId}/club/attendance_events/${eventId}`
    );
}

export async function getClubAttendanceEventParticipations(
    teamId: ID,
    eventId: ID
) {
    return await API.get<{
        participations: ClubAttendanceEventParticipation[];
    }>(`teams/${teamId}/club/attendance_events/${eventId}/participations`);
}

export async function bulkCreateClubAttendanceEventParticipations(
    teamId: ID,
    eventId: ID,
    member_ids: ID[]
) {
    return await API.post<{
        participations: ClubAttendanceEventParticipation[];
    }>(
        `teams/${teamId}/club/attendance_events/${eventId}/participations/bulk-create`,
        { member_ids }
    );
}

export async function updateClubAttendanceEventParticipation(
    teamId: ID,
    eventId: ID,
    participationId: ID,
    participation: Partial<ClubAttendanceEventParticipationRequestDTO>
) {
    return await API.put<{
        participation: ClubAttendanceEventParticipation;
    }>(
        `teams/${teamId}/club/attendance_events/${eventId}/participations/${participationId}`,
        participation
    );
}

export async function deleteClubAttendanceEventParticipation(
    teamId: ID,
    eventId: ID,
    participationId: ID
) {
    return await API.delete(
        `teams/${teamId}/club/attendance_events/${eventId}/participations/${participationId}`
    );
}
