import { handleError, handleSuccess } from "./utils.js";
import * as PageLoader from "./page-loader.js";
import AppMenubar from "../components/menubar.js";

const APPMENUBAR_CONTAINER = document.getElementById("orgatask_appmenubar");

$("document").ready(() => renderMenubar([], ""));

export function loadTeams() {
  return new Promise((resolve) => {
    $.getJSON({
      url: document.api_base_url + "teams",
      success: function (data) {

        window.orgatask.teams = data.teams;
        window.orgatask.default_team_id = data.default_team_id;
        if (!window.orgatask.selectedTeamId) {
          // No team selected; select default
          window.orgatask.selectedTeamId = data.default_team_id;
        } else {
          // Team selected; check if it is valid
          var validated = false;
          window.orgatask.teams.forEach((team) => {
            if (team.id === window.orgatask.selectedTeamId) {
              validated = true;
            }
          });
          if (!validated) {
            // Team not valid; fall back to default
            window.orgatask.selectedTeamId = data.default_team_id;
          }
        }

        renderMenubar(window.orgatask.teams, window.orgatask.selectedTeamId, switchTeam);

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
  window.orgatask.selectedTeamId = teamId;
  console.debug("Switching team to: " + window.orgatask.selectedTeamId);
  renderMenubar();
  PageLoader.exportToURL();
  PageLoader.loadPage();
}

function renderMenubar() {
  let data = window.orgatask;
  console.debug("Rendering menubar with", data.teams, data.selectedTeamId);
  ReactDOM.render(
    <AppMenubar
      teams={data.teams}
      selectedTeamId={data.selectedTeamId}
      onTeamSelect={switchTeam}
    />,
    APPMENUBAR_CONTAINER
  );
}
