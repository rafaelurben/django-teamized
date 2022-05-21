import { successAlert, confirmAlert, doubleConfirmAlert, waitingAlert } from "./alerts.js";
import * as API from "./api.js";
import * as Navigation from "./navigation.js";
import * as Cache from "./cache.js";

export { getTeamsList } from "./cache.js";

export function getCurentTeamData() {
    return window.orgatask.teamcache[window.orgatask.selectedTeamId];
}

export function isCurrentTeamAdmin() {
    const teamdata = getCurentTeamData();
    if (teamdata) {
        return ['owner', 'admin'].includes(teamdata.team.member.role);
    }
    return false;
}

export function ensureExistingTeam() {
  if (window.orgatask.selectedTeamId) {
    // Team selected; check if it is valid
    if (window.orgatask.selectedTeamId in window.orgatask.teamcache) {
      // Team is in cache, so it must be a valid team id
      return;
    }
  }
  
  // No team selected or team doesn't exist; select default
  console.log("No team selected or team doesn't exist; falling back to default");
  window.orgatask.selectedTeamId = window.orgatask.defaultTeamId;
  switchTeam(window.orgatask.selectedTeamId);
}

export function switchTeam(teamId) {
  if (window.orgatask.selectedTeamId === teamId) {
    // Already selected; no action needed
    return;
  }
  console.debug("Switching team to: " + teamId);

  window.orgatask.selectedTeamId = teamId;
  Navigation.exportToURL();
  Navigation.renderMenubar();
  Navigation.renderPage();
}

// Team loading

export async function loadTeams(full=false) {
  return await getTeams(full).then(
    (teams) => {
      ensureExistingTeam();

      Navigation.renderMenubar();
      return teams;
    }
  )
}

//// API calls ////

// User profile

export async function getProfile() {
  return await API.GET('profile').then(
    (data) => {
      window.orgatask.user = data.user;
      return data.user;
    }
  );
}

// Team list

export async function getTeams(full=false) {
  return await API.GET(full ? "teams?full=true" : "teams").then(
    (data) => {
      Cache.updateTeamsCache(data.teams, data.defaultTeamId);
      return data.teams;
    }
  )
}

// Team creation

export async function createTeam(name, description) {
  return await API.POST("teams", {
    name, description,
  }).then(
    async (data) => {
      successAlert(data);

      Cache.addTeam(data.team);
      switchTeam(data.team.id);

      return data.team;
    }
  )
}

export async function createTeamPopup() {
  return (await Swal.fire({
    title: "Team erstellen",
    html:
      '<label class="swal2-input-label" for="swal-input-name">Name:</label>' +
      '<input type="text" id="swal-input-name" class="swal2-input" placeholder="Teamname">' +
      '<label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>' +
      '<textarea id="swal-input-description" class="swal2-textarea" placeholder="Teambeschreibung">',
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Erstellen",
    cancelButtonText: "Abbrechen",
    preConfirm: async () => {
      const name = document.getElementById("swal-input-name").value;
      const description = document.getElementById(
        "swal-input-description"
      ).value;

      if (!name || !description) {
        Swal.showValidationMessage("Bitte fülle alle Felder aus");
        return false;
      }

      Swal.showLoading();
      return await createTeam(name, description);
    },
  })).value;
}

// Team edit

export async function editTeam(teamId, name, description) {
  return await API.POST(`teams/${teamId}`, {
    name, description,
  }).then(
    async (data) => {
      successAlert(data);
      window.orgatask.teamcache[teamId].team = data.team;
      return data.team;
    }
  )
}

export async function editTeamPopup(team) {
  return (await Swal.fire({
    title: "Team bearbeiten",
    html:
      `<p>Team: ${team.name}</p>` +
      '<label class="swal2-input-label" for="swal-input-name">Name:</label>' +
      `<input type="text" id="swal-input-name" class="swal2-input" placeholder="${team.name}" value="${team.name}">` +
      '<label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>' +
      `<textarea id="swal-input-description" class="swal2-textarea" placeholder="${team.description}">${team.description}</textarea>`,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Aktualisieren",
    cancelButtonText: "Abbrechen",
    preConfirm: async () => {
      const name = document.getElementById("swal-input-name").value;
      const description = document.getElementById(
        "swal-input-description"
      ).value;

      if (!name || !description) {
        Swal.showValidationMessage("Bitte fülle alle Felder aus");
        return false;
      }

      Swal.showLoading();
      return await editTeam(team.id, name, description);
    },
  })).value;
}

// Team deletion

export async function deleteTeam(teamId) {
  await API.DELETE("teams/"+teamId).then(
    async (data) => {
      successAlert(data);
      await Cache.deleteTeam(teamId);
      ensureExistingTeam();
      Navigation.renderMenubar();
      Navigation.renderPage();
    }
  )
}

export async function deleteTeamPopup(team) {
  return await doubleConfirmAlert(
    "Willst du folgendes Team wirklich löschen?<br /><br />" +
    `<b>Name:</b> ${team.name}<br /><b>Beschreibung: </b>${team.description}<br /><b>ID:</b> ${team.id}`, 
    async () => await deleteTeam(team.id)
  );
}

// Team leave

export async function leaveTeam(teamId) {
  await API.POST(`teams/${teamId}/leave`).then(
    async (data) => {
      successAlert(data);
      await Cache.deleteTeam(teamId);
      ensureExistingTeam();
      Navigation.renderMenubar();
      Navigation.renderPage();
    }
  )
}

export async function leaveTeamPopup(team) {
  return await confirmAlert(
    "Willst du folgendes Team wirklich verlassen?<br /><br />" +
    `<b>Name:</b> ${team.name}<br /><b>Beschreibung: </b>${team.description}<br /><b>ID:</b> ${team.id}`, 
    async () => await leaveTeam(team.id)
  );
}

// Member list

export async function getMembers(teamId) {
  return await API.GET(`teams/${teamId}/members`).then(
    (data) => {
      Cache.updateMembersCache(teamId, data.members);
      return data.members;
    }
  )
}

// Member edit

export async function editMember(teamId, memberId, role) {
  return await API.POST(`teams/${teamId}/members/${memberId}`, {
    role,
  }).then(
    (data) => {
      successAlert(data);
      window.orgatask.teamcache[teamId].members[memberId] = data.member;
      return data.id;
    }
  )
}

export async function promoteMemberPopup(team, member) {
  return await confirmAlert(
    `Willst du das Mitglied '${member.user.username}' (${member.user.last_name} ${member.user.first_name}) zu einem Administrator des Teams ${team.name} befördern?`,
    async () => await editMember(team.id, member.id, "admin")
  )
}

export async function demoteMemberPopup(team, member) {
  return await confirmAlert(
    `Willst du das Mitglied '${member.user.username}' (${member.user.last_name} ${member.user.first_name}) zu einem Mitglied des Teams ${team.name} degradieren?`,
    async () => await editMember(team.id, member.id, "member")
  )
}

// Member deletion

export async function deleteMember(teamId, memberId) {
  return await API.DELETE(`teams/${teamId}/members/${memberId}`).then(
    async (data) => {
      successAlert(data);
      delete window.orgatask.teamcache[teamId].members[memberId];
    }
  )
}

export async function deleteMemberPopup(team, member) {
  return await confirmAlert(
    `Willst du das Mitglied '${member.user.username}' (${member.user.last_name} ${member.user.first_name}) aus dem Team ${team.name} entfernen?`,
    async () => await deleteMember(team.id, member.id)
  );
}

// Invite list

export async function getInvites(teamId) {
  return await API.GET(`teams/${teamId}/invites`).then(
    (data) => {
      Cache.updateInvitesCache(teamId, data.invites);
      return data.invites;
    }
  )
}

// Invite creation

export async function createInvite(teamId, note, uses, days) {
  return await API.POST(`teams/${teamId}/invites`, {
    note, uses, days
  }).then(
    (data) => {
      successAlert(data);
      window.orgatask.teamcache[teamId].invites[data.invite.id] = data.invite;
      return data.invite;
    }
  )
}

export async function createInvitePopup(team) {
  return (await Swal.fire({
    title: `Einladung erstellen`,
    html:
      `<p>Team: ${team.name}</p>` +	
      '<label class="swal2-input-label" for="swal-input-uses">Anzahl Benutzungen:</label>' +
      '<input type="number" id="swal-input-uses" class="swal2-input" value="1">' +
      '<label class="swal2-input-label" for="swal-input-days">Gültigkeit in Tagen:</label>' +
      '<input type="number" id="swal-input-days" class="swal2-input" value="7">' +
      '<label class="swal2-input-label" for="swal-input-note">Notizen:</label>' +
      '<textarea id="swal-input-note" class="swal2-textarea" autofocus placeholder="z.B. Namen der Empfänger">',
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Erstellen",
    cancelButtonText: "Abbrechen",
    preConfirm: async () => {
      const uses = document.getElementById("swal-input-uses").value;
      const days = document.getElementById("swal-input-days").value;
      const note = document.getElementById(
        "swal-input-note"
      ).value;

      if (!uses || !days || !note) {
        Swal.showValidationMessage("Bitte fülle alle Felder aus");
        return false;
      }

      Swal.showLoading();
      return await createInvite(team.id, note, uses, days);
    },
  })).value;
}

// Invite edit

export async function editInvite(teamId, inviteId, note, uses, days) {
  return await API.POST(`teams/${teamId}/invites/${inviteId}`, {
    note, uses, days
  }).then(
    (data) => {
      successAlert(data);
      window.orgatask.teamcache[teamId].invites[data.invite.id] = data.invite;
      return data.invite;
    }
  )
}

export async function editInvitePopup(team, invite) {
  let days = (new Date(invite.valid_until * 1000) - new Date()) / 86400000;
  return (await Swal.fire({
    title: "Einladung bearbeiten",
    html:
      `<p>Team: ${team.name}</p>` +
      '<label class="swal2-input-label" for="swal-input-uses">Anzahl Benutzungen:</label>' +
      `<input type="number" id="swal-input-uses" class="swal2-input" value="${invite.uses_left}" placeholder="${invite.uses_left}">` +
      '<label class="swal2-input-label" for="swal-input-days">Gültigkeit in Tagen:</label>' +
      `<input type="number" id="swal-input-days" class= "swal2-input" value="${days}" placeholder="${days}">` +
      '<label class="swal2-input-label" for="swal-input-note">Notizen:</label>' +
      `<textarea id="swal-input-note" class="swal2-textarea" autofocus placeholder="${invite.note}">${invite.note}</textarea>`,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Aktualisieren",
    cancelButtonText: "Abbrechen",
    preConfirm: async () => {
      const uses = document.getElementById("swal-input-uses").value;
      const days = document.getElementById("swal-input-days").value;
      const note = document.getElementById(
        "swal-input-note"
      ).value;

      if (!uses || !days || !note) {
        Swal.showValidationMessage("Bitte fülle alle Felder aus");
        return false;
      }

      Swal.showLoading();
      return await editInvite(team.id, invite.id, note, uses, days);
    },
  })).value;
}

// Invite deletion

export async function deleteInvite(teamId, inviteId) {
  await API.DELETE(`teams/${teamId}/invites/${inviteId}`).then(
    async (data) => {
      successAlert(data);
      delete window.orgatask.teamcache[teamId].invites[inviteId];
    }
  )
}

export async function deleteInvitePopup(team, invite) {
  await confirmAlert(
    "Willst du folgende Einladung wirklich löschen?<br /><br />"+
    `<b>Notiz:</b> ${invite.note} <br /><b>Token: </b>${invite.token}`,
    async () => await deleteInvite(team.id, invite.id)
  );
}

// Invite accept

export async function acceptInvite(token) {
  waitingAlert("Einladung wird akzeptiert...");
  return await API.POST(`invites/${token}/accept`).then(
    (data) => {
      successAlert(data);

      Cache.addTeam(data.team);
      Navigation.exportToURL({removeParams: ["invite"]});
      switchTeam(data.team.id);

      return data.team;
    }
  )
}
