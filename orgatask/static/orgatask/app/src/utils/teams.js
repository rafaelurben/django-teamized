import { successAlert } from "./alerts.js";
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

export async function loadTeams() {
  await API.get("teams").then(
    function (data) {

      window.orgatask.teams = data.teams;
      window.orgatask.defaultTeamId = data.defaultTeamId;
      ensureExistingTeam();

      Navigation.renderMenubar();
    }
  )
}

export async function createTeam(title, description) {
  await API.post("teams", {
    title: title,
    description: description,
  }).then(async (data) => {
    await loadTeams();
    switchTeam(data.id);
    successAlert(data);
  })
}

export async function createTeamSwal() {
  await Swal.fire({
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

      return await createTeam(title, description);
    },
  });
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
