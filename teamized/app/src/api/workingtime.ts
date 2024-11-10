/**
 * Teamized Workingtime API
 */

import { ID } from '../interfaces/common';
import {
    Worksession,
    WorksessionRequestDTO,
} from '../interfaces/workingtime/worksession';
import { API } from './_base';

// Worksessions

export async function createWorksession(
    teamId: ID,
    session: WorksessionRequestDTO
) {
    return await API.post<{ session: Worksession }>(
        `teams/${teamId}/me/worksessions`,
        session
    );
}

export async function updateWorksession(
    teamId: ID,
    sessionId: ID,
    session: Partial<WorksessionRequestDTO>
) {
    return await API.put<{ session: Worksession }>(
        `teams/${teamId}/me/worksessions/${sessionId}`,
        session
    );
}

export async function deleteWorksession(teamId: ID, sessionId: ID) {
    return await API.delete(`teams/${teamId}/me/worksessions/${sessionId}`);
}

// Tracking

export async function startTrackingSession(teamId: ID) {
    return await API.post<{ session: Worksession }>(
        `me/worksessions/tracking/start/t=${teamId}`
    );
}

export async function getTrackingSession() {
    return await API.get<
        | { session: Worksession; error: undefined }
        | { session: undefined; error: 'no_active_tracking_session_exists' }
    >(`me/worksessions/tracking/live`, { disableErrorAlert: true });
}

export async function stopTrackingSession() {
    return await API.post<{ session: Worksession }>(
        `me/worksessions/tracking/stop`
    );
}
