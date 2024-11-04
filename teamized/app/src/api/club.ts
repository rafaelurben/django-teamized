/**
 * Teamized Club API
 */

import { API } from './_base';
import { ID } from '../interfaces/common';
import {
    ClubMember,
    ClubMemberRequestDTO,
} from '../interfaces/club/clubMember';
import { Club, ClubRequestDTO } from '../interfaces/club/club';
import {
    ClubMemberPortfolio,
    ClubMemberPortfolioRequestDTO,
} from '../interfaces/club/clubMemberPortfolio';
import { ClubGroup, ClubGroupRequestDTO } from '../interfaces/club/clubGroup';

// Clubs

export async function createClub(teamId: ID, club: ClubRequestDTO) {
    return await API.post<{ club: Club }>(`teams/${teamId}/create-club`, club);
}

export async function updateClub(teamId: ID, club: Partial<ClubRequestDTO>) {
    return await API.put<{ club: Club }>(`teams/${teamId}/club`, club);
}

export async function deleteClub(teamId: ID) {
    return await API.delete(`teams/${teamId}/club`);
}

// Members

export async function createClubMember(
    teamId: ID,
    member: ClubMemberRequestDTO
) {
    return await API.post<{ member: ClubMember }>(
        `teams/${teamId}/club/members`,
        member
    );
}

export async function updateClubMember(
    teamId: ID,
    memberId: ID,
    member: Partial<ClubMemberRequestDTO>
) {
    return await API.put<{ member: ClubMember }>(
        `teams/${teamId}/club/members/${memberId}`,
        member
    );
}

export async function deleteClubMember(teamId: ID, memberId: ID) {
    return await API.delete(`teams/${teamId}/club/members/${memberId}`);
}

// Portfolio

export async function getClubMemberPortfolio(teamId: ID, memberId: ID) {
    return await API.get<{ portfolio: ClubMemberPortfolio }>(
        `teams/${teamId}/club/members/${memberId}/portfolio`
    );
}

export async function updateClubMemberPortfolio(
    teamId: ID,
    memberId: ID,
    portfolio: Partial<ClubMemberPortfolioRequestDTO>
) {
    return await API.put<{ portfolio: ClubMemberPortfolio }>(
        `teams/${teamId}/club/members/${memberId}/portfolio`,
        portfolio
    );
}

// Magic link

export async function createClubMemberMagicLink(teamId: ID, memberId: ID) {
    return await API.post<{ url: string }>(
        `teams/${teamId}/club/members/${memberId}/create-magic-link`
    );
}

// Groups

export async function createClubGroup(teamId: ID, group: ClubGroupRequestDTO) {
    return await API.post<{ group: ClubGroup }>(
        `teams/${teamId}/club/groups`,
        group
    );
}

export async function updateClubGroup(
    teamId: ID,
    groupId: ID,
    group: Partial<ClubGroupRequestDTO>
) {
    return await API.put<{ group: ClubGroup }>(
        `teams/${teamId}/club/groups/${groupId}`,
        group
    );
}

export async function deleteClubGroup(teamId: ID, groupId: ID) {
    return await API.delete(`teams/${teamId}/club/groups/${groupId}`);
}

// Group membership

export async function addClubMemberToGroup(
    teamId: ID,
    memberId: ID,
    groupId: ID
) {
    return await API.post(
        `teams/${teamId}/club/members/${memberId}/membership/${groupId}`
    );
}

export async function removeClubMemberFromGroup(
    teamId: ID,
    memberId: ID,
    groupId: ID
) {
    return await API.delete(
        `teams/${teamId}/club/members/${memberId}/membership/${groupId}`
    );
}
