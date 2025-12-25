/**
 * Utils for the base team features
 */

import $ from 'jquery';
import React from 'react';

import * as TeamsAPI from '@/teamized/api/teams';
import { CacheCategory } from '@/teamized/interfaces/cache/cacheCategory';
import { ID } from '@/teamized/interfaces/common';
import { Invite, InviteRequestDTO } from '@/teamized/interfaces/teams/invite';
import { Member, MemberRequestDTO } from '@/teamized/interfaces/teams/member';
import { Team, TeamRequestDTO } from '@/teamized/interfaces/teams/team';
import {
    confirmAlert,
    doubleConfirmAlert,
    errorToast,
    fireAlert,
    Swal,
    toast,
    waitingToast,
} from '@/teamized/utils/alerts';
import { isoFormat, localInputFormat } from '@/teamized/utils/datetime';
import { validateUUID } from '@/teamized/utils/general';

import * as CacheService from './cache.service';

export { getTeamsList } from './cache.service';

//// API calls ////

// Team list

export async function getTeams() {
    return await TeamsAPI.getTeams().then((data) => {
        CacheService.updateTeamsCache(data.teams, data.defaultTeamId);
        return data.teams;
    });
}

// Team creation

export async function createTeam(team: TeamRequestDTO) {
    return await TeamsAPI.createTeam(team).then(async (data) => {
        CacheService.addTeam(data.team);
        return data.team;
    });
}

export async function createTeamPopup() {
    return await fireAlert<Team>({
        title: 'Team erstellen',
        html: (
            <>
                <label className="swal2-input-label" htmlFor="swal-input-name">
                    Name:
                </label>
                <input
                    type="text"
                    id="swal-input-name"
                    className="swal2-input"
                    placeholder="Teamname"
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
                    placeholder="Teambeschreibung"
                />
            </>
        ),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Erstellen',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const name = $('#swal-input-name').val() as string;
            const description = $('#swal-input-description').val() as string;

            if (!name || !description) {
                Swal.showValidationMessage('Bitte fülle alle Felder aus!');
                return false;
            }

            Swal.showLoading();
            return await createTeam({ name, description });
        },
    });
}

// Team edit

export async function editTeam(teamId: ID, team: Partial<TeamRequestDTO>) {
    return await TeamsAPI.updateTeam(teamId, team).then(async (data) => {
        CacheService.getTeamData(teamId).team = data.team;
        return data.team;
    });
}

export async function editTeamPopup(team: Team) {
    return await fireAlert<Team>({
        title: 'Team bearbeiten',
        html: (
            <>
                <p>Team: {team.name}</p>
                <hr className="tw:my-2" />
                <label className="swal2-input-label" htmlFor="swal-input-name">
                    Name:
                </label>
                <input
                    type="text"
                    id="swal-input-name"
                    className="swal2-input"
                    placeholder={team.name}
                    defaultValue={team.name}
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
                    placeholder={team.description ?? ''}
                    defaultValue={team.description ?? ''}
                />
            </>
        ),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Aktualisieren',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const name = $('#swal-input-name').val() as string;
            const description = $('#swal-input-description').val() as string;

            if (!name || !description) {
                Swal.showValidationMessage('Bitte fülle alle Felder aus!');
                return false;
            }

            Swal.showLoading();
            return await editTeam(team.id, { name, description });
        },
    });
}

// Team deletion

export async function deleteTeam(teamId: ID) {
    return await TeamsAPI.deleteTeam(teamId).then(async () => {
        await CacheService.deleteTeam(teamId);
    });
}

export async function deleteTeamPopup(team: Team) {
    return await doubleConfirmAlert(
        <>
            Willst du folgendes Team wirklich löschen?
            <br />
            <br />
            <b>Name:</b> {team.name}
            <br />
            <b>Beschreibung:</b> {team.description}
            <br />
            <b>ID:</b> {team.id}
        </>,
        async () => await deleteTeam(team.id)
    );
}

// Team leave

export async function leaveTeam(teamId: ID) {
    return await TeamsAPI.leaveTeam(teamId).then(async () => {
        await CacheService.deleteTeam(teamId);
    });
}

export async function leaveTeamPopup(team: Team) {
    return await confirmAlert(
        <>
            Willst du folgendes Team wirklich verlassen?
            <br />
            <br />
            <b>Name:</b> {team.name}
            <br />
            <b>Beschreibung: </b> {team.description}
            <br />
            <b>ID:</b> {team.id}
        </>,
        async () => await leaveTeam(team.id)
    );
}

// Member list

export async function getMembers(teamId: ID) {
    const members = await CacheService.refreshTeamCacheCategory<Member>(
        teamId,
        CacheCategory.MEMBERS
    );
    CacheService.getTeamData(teamId).team.membercount = members.length;
    return members;
}

// Member edit

export async function editMember(
    teamId: ID,
    memberId: ID,
    member: Partial<MemberRequestDTO>
) {
    return await TeamsAPI.updateMember(teamId, memberId, member).then(
        (data) => {
            CacheService.getTeamData(teamId).members[memberId] = data.member;
            return data.id;
        }
    );
}

export async function promoteMemberPopup(team: Team, member: Member) {
    return await confirmAlert(
        <>
            Willst du das Mitglied{' '}
            <b>
                {member.user.username} ({member.user.last_name}{' '}
                {member.user.first_name})
            </b>{' '}
            zu einem Administrator des Teams <b>{team.name}</b> befördern?
        </>,
        async () => await editMember(team.id, member.id, { role: 'admin' })
    );
}

export async function demoteMemberPopup(team: Team, member: Member) {
    return await confirmAlert(
        <>
            Willst du{' '}
            <b>
                {member.user.username} ({member.user.last_name}{' '}
                {member.user.first_name})
            </b>{' '}
            von einem Administrator zu einem Mitglied des Teams {team.name}{' '}
            degradieren?
        </>,
        async () => await editMember(team.id, member.id, { role: 'member' })
    );
}

// Member deletion

export async function deleteMember(teamId: ID, memberId: ID) {
    return await TeamsAPI.deleteMember(teamId, memberId).then(async () => {
        const teamData = CacheService.getTeamData(teamId);
        delete teamData.members[memberId];
        teamData.team.membercount -= 1;
    });
}

export async function deleteMemberPopup(team: Team, member: Member) {
    return await confirmAlert(
        <>
            Willst du das Mitglied{' '}
            <b>
                {member.user.username} ({member.user.last_name}{' '}
                {member.user.first_name})
            </b>{' '}
            aus dem Team {team.name} entfernen?
        </>,
        async () => await deleteMember(team.id, member.id)
    );
}

// Invite list

export async function getInvites(teamId: ID) {
    return await CacheService.refreshTeamCacheCategory<Invite>(
        teamId,
        CacheCategory.INVITES
    );
}

// Invite creation

export async function createInvite(
    teamId: ID,
    invite: InviteRequestDTO
): Promise<Invite> {
    return await waitingToast(
        'Einladung wird erstellt...',
        TeamsAPI.createInvite(teamId, invite).then((data) => {
            CacheService.getTeamData(teamId).invites[data.invite.id] =
                data.invite;
            toast.success('Einladung erstellt', {
                description: `Token: ${data.invite.token}`,
                action: {
                    label: 'URL kopieren',
                    onClick: () =>
                        void navigator.clipboard.writeText(data.invite.url),
                },
                duration: 100000,
            });
            return data.invite;
        })
    );
}

export async function createInvitePopup(team: Team) {
    return await fireAlert<Invite>({
        title: `Einladung erstellen`,
        html: (
            <>
                <p>Team: {team.name}</p>
                <hr className="tw:my-2" />
                <label className="swal2-input-label" htmlFor="swal-input-note">
                    Notizen:
                </label>
                <textarea
                    id="swal-input-note"
                    className="swal2-textarea"
                    autoFocus
                    placeholder="z.B. Namen der Empfänger"
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-uses_left"
                >
                    Anzahl Benutzungen:
                </label>
                <input
                    type="number"
                    id="swal-input-uses_left"
                    className="swal2-input"
                    defaultValue={1}
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-valid_until"
                >
                    Gültig bis:
                </label>
                <input
                    type="datetime-local"
                    id="swal-input-valid_until"
                    className="swal2-input"
                    defaultValue={''}
                />
            </>
        ),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Erstellen',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const note = $('#swal-input-note').val() as string;
            const uses_left = $('#swal-input-uses_left').val() as number;
            const valid_until = $('#swal-input-valid_until').val() as string;

            if (!uses_left || !note) {
                Swal.showValidationMessage(
                    'Bitte fülle die Felder Notizen und Anzahl Benutzungen aus!'
                );
                return false;
            }

            Swal.showLoading();
            return await createInvite(team.id, {
                note,
                uses_left,
                valid_until: isoFormat(valid_until),
            });
        },
    });
}

// Invite edit

export async function editInvite(
    teamId: ID,
    inviteId: ID,
    invite: Partial<InviteRequestDTO>
) {
    return await TeamsAPI.updateInvite(teamId, inviteId, invite).then(
        (data) => {
            CacheService.getTeamData(teamId).invites[data.invite.id] =
                data.invite;
            return data.invite;
        }
    );
}

export async function editInvitePopup(team: Team, invite: Invite) {
    return await fireAlert({
        title: 'Einladung bearbeiten',
        html: (
            <>
                <p>Team: {team.name}</p>
                <hr className="tw:my-2" />
                <label className="swal2-input-label" htmlFor="swal-input-note">
                    Notizen:
                </label>
                <textarea
                    id="swal-input-note"
                    className="swal2-textarea"
                    autoFocus
                    placeholder={invite.note}
                    defaultValue={invite.note}
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-uses_left"
                >
                    Anzahl Benutzungen:
                </label>
                <input
                    type="number"
                    id="swal-input-uses_left"
                    className="swal2-input"
                    defaultValue={invite.uses_left}
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-valid_until"
                >
                    Gültig bis:
                </label>
                <input
                    type="datetime-local"
                    id="swal-input-valid_until"
                    className="swal2-input"
                    defaultValue={localInputFormat(invite.valid_until)}
                />
            </>
        ),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Aktualisieren',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const note = $('#swal-input-note').val() as string;
            const uses_left = $('#swal-input-uses_left').val() as number;
            const valid_until = $('#swal-input-valid_until').val() as string;

            if (!uses_left || !note) {
                Swal.showValidationMessage(
                    'Bitte fülle die Felder Notizen und Anzahl Benutzungen aus!'
                );
                return false;
            }

            Swal.showLoading();
            return await editInvite(team.id, invite.id, {
                note,
                uses_left,
                valid_until: isoFormat(valid_until),
            });
        },
    });
}

// Invite deletion

export async function deleteInvite(teamId: ID, inviteId: ID) {
    return await TeamsAPI.deleteInvite(teamId, inviteId).then(async () => {
        delete CacheService.getTeamData(teamId).invites[inviteId];
    });
}

export async function deleteInvitePopup(team: Team, invite: Invite) {
    return await confirmAlert(
        <>
            Willst du folgende Einladung wirklich löschen?
            <br />
            <br />
            <b>Notiz:</b> {invite.note}
            <br />
            <b>Token:</b> {invite.token}
        </>,
        async () => await deleteInvite(team.id, invite.id)
    );
}

// Invite check & accept

export async function acceptInvite(token: string) {
    return await TeamsAPI.acceptInvite(token).then(async (data) => {
        CacheService.addTeam(data.team);
        await getMembers(data.team.id);
        return data.team;
    });
}

export async function checkInvitePopup(token: string) {
    if (!validateUUID(token)) {
        errorToast(
            'Ungültiges Einladungsformat',
            'Diese Einladung liegt nicht im richtigen Format vor.'
        );
        throw new Error('invalid-invite-format');
    }

    const data = await waitingToast(
        'Einladung prüfen...',
        TeamsAPI.checkInvite(token)
    );

    if (data.status !== 'invite-valid') {
        throw new Error('invalid-invite');
    }

    const team = data.team;
    return await confirmAlert(
        <>
            Möchtest du folgendem Team beitreten?
            <br />
            <br />
            <b>Name:</b> {team.name}
            <br />
            <b>Beschreibung: </b>
            {team.description}
            <br />
            <b>Anzahl Mitglieder: </b>
            {team.membercount}
            <br />
        </>,
        async () => {
            return await acceptInvite(token);
        },
        'Du wurdest eingeladen',
        {
            icon: 'info',
            confirmButtonColor: 'green',
            confirmButtonText: 'Einladung akzeptieren',
            cancelButtonText: 'Nein, später',
        }
    );
}

// Invite from URL

export async function checkURLInvite() {
    const token = new URL(window.location.href).searchParams.get('invite');
    if (!token) return;
    return await checkInvitePopup(token);
}
