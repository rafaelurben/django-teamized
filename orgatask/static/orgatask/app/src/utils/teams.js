import { handleError, handleSuccess } from "./handlers.js";
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

export function loadTeams() {
  return new Promise((resolve) => {
    $.getJSON({
      url: document.api_base_url + "teams",
      success: function (data) {

        window.orgatask.teams = data.teams;
        window.orgatask.defaultTeamId = data.defaultTeamId;
        ensureExistingTeam();

        Navigation.renderMenubar();

        resolve("resolved");
      },
      error: handleError,
    });
  });
}

export function createTeam(title, description) {
  return new Promise((resolve) => {
    $.ajax({
      url: document.api_base_url + "teams",
      type: "POST",
      data: {
        title: title,
        description: description,
      },
      success: async (data) => {
        await loadTeams();
        switchTeam(data.id);
        handleSuccess(data);
        resolve(data);
      },
      error: handleError,
    });
  });
}

export function createTeamSwal() {
  return new Promise(async (resolve) => {
    const { value } = await Swal.fire({
      title: "Team erstellen",
      html:
        '<input type="text" id="swal-input-title" class="swal2-input" placeholder="Titel">' +
        '<textarea id="swal-input-description" class="swal2-textarea" placeholder="Beschreibung">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Erstellen",
      cancelButtonText: "Abbrechen",
      preConfirm: () => {
        const title = document.getElementById("swal-input-title").value;
        const description = document.getElementById(
          "swal-input-description"
        ).value;

        return new Promise(async (resolve) => {
          await createTeam(title, description);
          resolve("resolved");
        });
      },
    });

    resolve(value);
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
