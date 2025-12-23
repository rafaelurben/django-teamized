/**
 * Teamized Teams API
 */

import { ID } from '@/teamized/interfaces/common';
import { Invite, InviteRequestDTO } from '@/teamized/interfaces/teams/invite';
import { Member, MemberRequestDTO } from '@/teamized/interfaces/teams/member';
import { Team, TeamRequestDTO } from '@/teamized/interfaces/teams/team';

import { API } from './_base';

// Teams

export async function getTeams() {
    return await API.get<{ teams: Team[]; defaultTeamId: ID }>('teams');
}

export async function createTeam(team: TeamRequestDTO) {
    return await API.post<{ team: Team }>(`teams`, team);
}

export async function updateTeam(teamId: ID, team: Partial<TeamRequestDTO>) {
    return await API.put<{ team: Team }>(`teams/${teamId}`, team);
}

export async function deleteTeam(teamId: ID) {
    return await API.delete(`teams/${teamId}`);
}

// Leave

export async function leaveTeam(teamId: ID) {
    return await API.post(`teams/${teamId}/leave`);
}

// Members

export async function updateMember(
    teamId: ID,
    memberId: ID,
    member: Partial<MemberRequestDTO>
) {
    return await API.put<{ member: Member }>(
        `teams/${teamId}/members/${memberId}`,
        member
    );
}

export async function deleteMember(teamId: ID, memberId: ID) {
    return await API.delete(`teams/${teamId}/members/${memberId}`);
}

// Invites

export async function createInvite(teamId: ID, invite: InviteRequestDTO) {
    return await API.post<{ invite: Invite }>(
        `teams/${teamId}/invites`,
        invite
    );
}

export async function updateInvite(
    teamId: ID,
    inviteId: ID,
    invite: Partial<InviteRequestDTO>
) {
    return await API.put<{ invite: Invite }>(
        `teams/${teamId}/invites/${inviteId}`,
        invite
    );
}

export async function deleteInvite(teamId: ID, inviteId: ID) {
    return await API.delete(`teams/${teamId}/invites/${inviteId}`);
}

export async function checkInvite(token: string) {
    return await API.get<{ team: Team; status: 'invite-valid' }>(
        `invites/${token}/info`
    ).catch((): { status: 'invite-invalid' } => {
        return { status: 'invite-invalid' };
    });
}

export async function acceptInvite(token: string) {
    return await API.post<{ team: Team }>(`invites/${token}/accept`);
}

// Item category

export async function getItemsOfCategory<T>(teamId: ID, category: string) {
    return await API.get<T>(`teams/${teamId}/${category.replace('_', '/')}`);
}
