import { successAlert, confirmAlert, waitingAlert } from "./alerts.js";
import * as API from "./api.js";
import * as Navigation from "./navigation.js";

export function ensureExistingTeam() {
  if (window.orgatask.selectedTeamId) {
    // Team selected; check if it is valid

    for (let team of window.orgatask.teams) {
      if (team.id === window.orgatask.selectedTeamId) {
        // Team exists; no action needed
        return;
      }
    }
  }
  
  // No team selected or team doesn't exist; select default
  console.log("No team selected or team doesn't exist; falling back to default");
  window.orgatask.selectedTeamId = window.orgatask.defaultTeamId;
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

export async function loadTeams() {
  return await API.GET("teams").then(
    (data) => {
      window.orgatask.teams = data.teams;
      window.orgatask.defaultTeamId = data.defaultTeamId;
      ensureExistingTeam();

      Navigation.renderMenubar();
      return data.teams;
    }
  )
}

// Team creation

export async function createTeam(title, description) {
  return await API.POST("teams", {
    title, description,
  }).then(
    async (data) => {
      successAlert(data);

      await loadTeams();
      switchTeam(data.team.id);

      return data.team;
    }
  )
}

export async function createTeamSwal() {
  return (await Swal.fire({
    title: "Team erstellen",
    html:
      '<input type="text" id="swal-input-title" class="swal2-input" placeholder="Titel">' +
      '<textarea id="swal-input-description" class="swal2-textarea" placeholder="Beschreibung">',
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Erstellen",
    cancelButtonText: "Abbrechen",
    preConfirm: async () => {
      const title = document.getElementById("swal-input-title").value;
      const description = document.getElementById(
        "swal-input-description"
      ).value;

      if (!title || !description) {
        Swal.showValidationMessage("Bitte fülle alle Felder aus");
        return false;
      }

      Swal.showLoading();
      return await createTeam(title, description);
    },
  })).value;
}

// Team deletion

export async function deleteTeam(teamId) {
  await API.DELETE("teams/"+teamId).then(
    async (data) => {
      await loadTeams();
      if (window.orgatask.selectedTeamId === teamId) {
        switchTeam(window.orgatask.defaultTeamId);
      }
      Navigation.renderPage();
      successAlert(data);
    }
  )
}

export function deleteTeamWithConfirmation(team) {
  confirmAlert(
    `Willst du das Team '${team.title}' (${team.id}) wirklich löschen?`, 
    () => deleteTeam(team.id)
  );
}

// Team leave

export async function leaveTeam(teamId) {
  await API.POST(`teams/${teamId}/leave`).then(async (data) => {
    await loadTeams();
    if (window.orgatask.selectedTeamId === teamId) {
      switchTeam(window.orgatask.defaultTeamId);
    }
    Navigation.renderPage();
    successAlert(data);
  })
}

export function leaveTeamWithConfirmation(team) {
  confirmAlert(
    `Willst du das Team '${team.title}' (${team.id}) wirklich verlassen?`,
    () => leaveTeam(team.id)
  );
}

// Invite list

export async function loadInvites(teamId) {
  return await API.GET(`teams/${teamId}/invites`).then(
    (data) => {
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
      return data.invite;
    }
  )
}

export async function createInviteSwal(team) {
  return (await Swal.fire({
    title: `Einladung erstellen`,
    html:
      `<p>Team: ${team.title}</p>` +	
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

// Invite deletion

export async function deleteInvite(teamId, inviteId) {
  await API.DELETE(`teams/${teamId}/invites/${inviteId}`).then(
    async (data) => {
      successAlert(data);
    }
  )
}

export function deleteInviteWithConfirmation(team, invite) {
  confirmAlert(
    `Willst du die Einladung '${invite.note}' (Token ${invite.token}) wirklich löschen?`,
    () => deleteInvite(team.id, invite.id)
  );
}

// Invite accept

export async function acceptInvite(token) {
  waitingAlert("Einladung wird akzeptiert...");
  return await API.POST(`invites/${token}/accept`).then(
    async (data) => {
      successAlert(data);

      await loadTeams();
      switchTeam(data.team.id);

      return data.team;
    }
  )
}
