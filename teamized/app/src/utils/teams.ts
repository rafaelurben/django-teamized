/**
 * Utils for the base team features
 */

import $ from 'jquery';

import {
    confirmAlert,
    doubleConfirmAlert,
    infoAlert,
    requestSuccessAlert,
    Swal,
} from './alerts';
import * as TeamsAPI from '../api/teams';
import { isoFormat, localInputFormat } from './datetime';
import * as Navigation from './navigation';
import * as Cache from './cache';
import * as Utils from './utils';
import { Team, TeamRequestDTO } from '../interfaces/teams/team';
import { ID } from '../interfaces/common';
import { Member, MemberRequestDTO } from '../interfaces/teams/member';
import { Invite, InviteRequestDTO } from '../interfaces/teams/invite';
import { CacheCategory } from '../interfaces/cache/cacheCategory';

export { getTeamsList } from './cache';

export function isCurrentTeamAdmin() {
    const teamData = Cache.getCurrentTeamData();
    if (teamData) {
        return ['owner', 'admin'].includes(teamData.team.member?.role || '');
    }
    return false;
}

export function hasCurrentTeamLinkedClub() {
    const teamData = Cache.getCurrentTeamData();
    if (teamData) {
        return teamData.team.club !== null;
    }
    return false;
}

export function ensureExistingTeam() {
    if (window.appdata.selectedTeamId) {
        // Team selected; check if it is valid
        if (window.appdata.selectedTeamId in window.appdata.teamCache) {
            // Team is in cache, so it must be a valid team id
            return;
        }
    }

    // No team selected or team doesn't exist; select default
    console.log(
        "No team selected or team doesn't exist; falling back to default"
    );
    switchTeam(window.appdata.defaultTeamId);
}

export function switchTeam(teamId: ID) {
    if (window.appdata.selectedTeamId === teamId) {
        // Already selected; no action needed
        return;
    }
    console.debug('Switching team to: ' + teamId);

    window.appdata.selectedTeamId = teamId;
    Navigation.exportToURL();
    Navigation.render();
}

//// API calls ////

// Team list

export async function getTeams() {
    return await TeamsAPI.getTeams().then((data) => {
        Cache.updateTeamsCache(data.teams, data.defaultTeamId);
        ensureExistingTeam();
        return data.teams;
    });
}

// Team creation

export async function createTeam(team: TeamRequestDTO) {
    return await TeamsAPI.createTeam(team).then(async (data) => {
        requestSuccessAlert(data);

        Cache.addTeam(data.team);
        switchTeam(data.team.id);

        return data.team;
    });
}

export async function createTeamPopup() {
    return (
        await Swal.fire({
            title: 'Team erstellen',
            html: `
      <label class="swal2-input-label mt-0" for="swal-input-name">Name:</label>
      <input type="text" id="swal-input-name" class="swal2-input" placeholder="Teamname">
      <label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>
      <textarea id="swal-input-description" class="swal2-textarea" placeholder="Teambeschreibung"></textarea>
    `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Erstellen',
            cancelButtonText: 'Abbrechen',
            preConfirm: async () => {
                const name = <string>$('#swal-input-name').val();
                const description = <string>$('#swal-input-description').val();

                if (!name || !description) {
                    Swal.showValidationMessage('Bitte fülle alle Felder aus!');
                    return false;
                }

                Swal.showLoading();
                return await createTeam({ name, description }).then(() => {
                    Navigation.selectPage('team');
                });
            },
        })
    ).value;
}

// Team edit

export async function editTeam(teamId: ID, team: Partial<TeamRequestDTO>) {
    return await TeamsAPI.updateTeam(teamId, team).then(async (data) => {
        requestSuccessAlert(data);
        Cache.getTeamData(teamId).team = data.team;
        return data.team;
    });
}

export async function editTeamPopup(team: Team) {
    return (
        await Swal.fire({
            title: 'Team bearbeiten',
            html: `
      <p>Team: ${team.name}</p><hr />
      <label class="swal2-input-label" for="swal-input-name">Name:</label>
      <input type="text" id="swal-input-name" class="swal2-input" placeholder="${team.name}" value="${team.name}">
      <label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>
      <textarea id="swal-input-description" class="swal2-textarea" placeholder="${team.description}">${team.description}</textarea>
    `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Aktualisieren',
            cancelButtonText: 'Abbrechen',
            preConfirm: async () => {
                const name = <string>$('#swal-input-name').val();
                const description = <string>$('#swal-input-description').val();

                if (!name || !description) {
                    Swal.showValidationMessage('Bitte fülle alle Felder aus!');
                    return false;
                }

                Swal.showLoading();
                return await editTeam(team.id, { name, description });
            },
        })
    ).value;
}

// Team deletion

export async function deleteTeam(teamId: ID) {
    await TeamsAPI.deleteTeam(teamId).then(async (data) => {
        requestSuccessAlert(data);
        await Cache.deleteTeam(teamId);
        ensureExistingTeam();
        Navigation.selectPage('teamlist');
    });
}

export async function deleteTeamPopup(team: Team) {
    return await doubleConfirmAlert(
        'Willst du folgendes Team wirklich löschen?<br /><br />' +
            `<b>Name:</b> ${team.name}<br /><b>Beschreibung: </b>${team.description}<br /><b>ID:</b> ${team.id}`,
        async () => await deleteTeam(team.id)
    );
}

// Team leave

export async function leaveTeam(teamId: ID) {
    await TeamsAPI.leaveTeam(teamId).then(async (data) => {
        requestSuccessAlert(data);
        await Cache.deleteTeam(teamId);
        ensureExistingTeam();
        Navigation.selectPage('teamlist');
    });
}

export async function leaveTeamPopup(team: Team) {
    return await confirmAlert(
        'Willst du folgendes Team wirklich verlassen?<br /><br />' +
            `<b>Name:</b> ${team.name}<br /><b>Beschreibung: </b>${team.description}<br /><b>ID:</b> ${team.id}`,
        async () => await leaveTeam(team.id)
    );
}

// Member list

export async function getMembers(teamId: ID) {
    let members = await Cache.refreshTeamCacheCategory<Member>(
        teamId,
        CacheCategory.MEMBERS
    );
    Cache.getTeamData(teamId).team.membercount = members.length;
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
            requestSuccessAlert(data);
            Cache.getTeamData(teamId).members[memberId] = data.member;
            return data.id;
        }
    );
}

export async function promoteMemberPopup(team: Team, member: Member) {
    return await confirmAlert(
        `Willst du das Mitglied '${member.user.username}' (${member.user.last_name} ${member.user.first_name}) zu einem Administrator des Teams ${team.name} befördern?`,
        async () => await editMember(team.id, member.id, { role: 'admin' })
    );
}

export async function demoteMemberPopup(team: Team, member: Member) {
    return await confirmAlert(
        `Willst du '${member.user.username}' (${member.user.last_name} ${member.user.first_name}) von einem Administrator zu einem Mitglied des Teams ${team.name} degradieren?`,
        async () => await editMember(team.id, member.id, { role: 'member' })
    );
}

// Member deletion

export async function deleteMember(teamId: ID, memberId: ID) {
    return await TeamsAPI.deleteMember(teamId, memberId).then(async (data) => {
        requestSuccessAlert(data);
        let teamData = Cache.getTeamData(teamId);
        delete teamData.members[memberId];
        teamData.team.membercount -= 1;
    });
}

export async function deleteMemberPopup(team: Team, member: Member) {
    return await confirmAlert(
        `Willst du das Mitglied '${member.user.username}' (${member.user.last_name} ${member.user.first_name}) aus dem Team ${team.name} entfernen?`,
        async () => await deleteMember(team.id, member.id)
    );
}

// Invite list

export async function getInvites(teamId: ID) {
    return await Cache.refreshTeamCacheCategory<Invite>(
        teamId,
        CacheCategory.INVITES
    );
}

// Invite creation

export async function createInvite(teamId: ID, invite: InviteRequestDTO) {
    return await TeamsAPI.createInvite(teamId, invite).then((data) => {
        requestSuccessAlert(data);
        Cache.getTeamData(teamId).invites[data.invite.id] = data.invite;
        return data.invite;
    });
}

export async function createInvitePopup(team: Team) {
    return (
        await Swal.fire({
            title: `Einladung erstellen`,
            html: `
      <p>Team: ${team.name}</p><hr />
      <label class="swal2-input-label" for="swal-input-note">Notizen:</label>
      <textarea id="swal-input-note" class="swal2-textarea" autofocus placeholder="z.B. Namen der Empfänger"></textarea>
      <label class="swal2-input-label" for="swal-input-uses_left">Anzahl Benutzungen:</label>
      <input type="number" id="swal-input-uses_left" class="swal2-input" value="1">
      <label class="swal2-input-label" for="swal-input-valid_until">Gültig bis:</label>
      <input type="datetime-local" id="swal-input-valid_until" class="swal2-input" value="">
    `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Erstellen',
            cancelButtonText: 'Abbrechen',
            preConfirm: async () => {
                const note = <string>$('#swal-input-note').val();
                const uses_left = <number>$('#swal-input-uses_left').val();
                const valid_until = <string>$('#swal-input-valid_until').val();

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
        })
    ).value;
}

// Invite edit

export async function editInvite(
    teamId: ID,
    inviteId: ID,
    invite: Partial<InviteRequestDTO>
) {
    return await TeamsAPI.updateInvite(teamId, inviteId, invite).then(
        (data) => {
            requestSuccessAlert(data);
            Cache.getTeamData(teamId).invites[data.invite.id] = data.invite;
            return data.invite;
        }
    );
}

export async function editInvitePopup(team: Team, invite: Invite) {
    return (
        await Swal.fire({
            title: 'Einladung bearbeiten',
            html: `
      <p>Team: ${team.name}</p><hr />
      <label class="swal2-input-label" for="swal-input-note">Notizen:</label>
      <textarea id="swal-input-note" class="swal2-textarea" autofocus placeholder="${invite.note}">${invite.note}</textarea>
      <label class="swal2-input-label" for="swal-input-uses_left">Anzahl Benutzungen:</label>
      <input type="number" id="swal-input-uses_left" class="swal2-input" value="${invite.uses_left}" placeholder="${invite.uses_left}">
      <label class="swal2-input-label" for="swal-input-valid_until">Gültig bis:</label>
      <input type="datetime-local" id="swal-input-valid_until" class="swal2-input" value="${localInputFormat(invite.valid_until)}">
    `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Aktualisieren',
            cancelButtonText: 'Abbrechen',
            preConfirm: async () => {
                const note = <string>$('#swal-input-note').val();
                const uses_left = <number>$('#swal-input-uses_left').val();
                const valid_until = <string>$('#swal-input-valid_until').val();

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
        })
    ).value;
}

// Invite deletion

export async function deleteInvite(teamId: ID, inviteId: ID) {
    await TeamsAPI.deleteInvite(teamId, inviteId).then(async (data) => {
        requestSuccessAlert(data);
        delete Cache.getTeamData(teamId).invites[inviteId];
    });
}

export async function deleteInvitePopup(team: Team, invite: Invite) {
    await confirmAlert(
        'Willst du folgende Einladung wirklich löschen?<br /><br />' +
            `<b>Notiz:</b> ${invite.note} <br /><b>Token: </b>${invite.token}`,
        async () => await deleteInvite(team.id, invite.id)
    );
}

// Invite check & accept

export async function acceptInvite(token: string) {
    return await TeamsAPI.acceptInvite(token).then(async (data) => {
        requestSuccessAlert(data);

        Cache.addTeam(data.team);
        switchTeam(data.team.id);
        Navigation.exportToURL({ removeParams: ['invite'] });

        await getMembers(data.team.id);
        return data.team;
    });
}

export async function checkInvitePopup(token: string) {
    if (!Utils.validateUUID(token)) {
        infoAlert(
            'Ungültiges Einladungsformat',
            'Diese Einladung liegt nicht im richtigen Format vor.'
        );
        Navigation.exportToURL({ removeParams: ['invite'] });
        return;
    }

    const data = await TeamsAPI.checkInvite(token);

    if (data.status === 'invite-valid') {
        const team = data.team;
        await confirmAlert(
            `Möchtest du folgendem Team beitreten?<br /><br />
      <b>Name:</b> ${team.name}<br />
      <b>Beschreibung: </b>${team.description}<br />
      <b>Anzahl Mitglieder: </b>${team.membercount}<br />`,
            async () => {
                Swal.showLoading();
                await acceptInvite(token);
                Navigation.selectPage('team');
            },
            'Du wurdest eingeladen',
            {
                icon: 'info',
                confirmButtonColor: 'green',
                confirmButtonText: 'Einladung akzeptieren',
                cancelButtonText: 'Nein, später',
            }
        );
    } else {
        Navigation.exportToURL({ removeParams: ['invite'] });
    }
}

// Invite from URL

export async function checkURLInvite() {
    const token = new URL(window.location.href).searchParams.get('invite');
    if (!token) return;
    return await checkInvitePopup(token);
}
