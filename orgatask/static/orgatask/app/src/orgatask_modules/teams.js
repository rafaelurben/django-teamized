import { handleError, handleSuccess } from './utils.js';
import * as PageLoader from './page-loader.js';

const teamswitcher = $('#teamswitcher');

export function loadTeams() {
    return new Promise(resolve => {
        $.getJSON({
            url: document.api_base_url + 'teams', 
            success: function(data) {
                teamswitcher.empty();

                window.orgatask.teams = data.teams;
                window.orgatask.default_team_id = data.default_team_id;
                if (!window.orgatask.selected_team_id) {
                    // No team selected; select default
                    window.orgatask.selected_team_id = data.default_team_id;
                } else {
                    // Team selected; check if it is valid
                    var validated = false;
                    window.orgatask.teams.forEach(team => {
                        if (team.id === window.orgatask.selected_team_id) {
                            validated = true;
                        }
                    });
                    if (!validated) {
                        // Team not valid; fall back to default
                        window.orgatask.selected_team_id = data.default_team_id;
                    }
                }

                window.orgatask.teams.forEach(team => {
                    if (team.id === window.orgatask.selected_team_id) {
                        teamswitcher.append(`<option selected value="${team.id}">${team.title}</option>`);
                    } else {
                        teamswitcher.append(`<option value="${team.id}">${team.title}</option>`);
                    }
                });

                resolve('resolved');
            },
            error: handleError,
        });
    });
}

export function createTeam(title, description) {
    return new Promise(resolve => {
        $.ajax({
            url: document.api_base_url + 'teams',
            type: 'POST',
            data: {
                title: title,
                description: description,
            },
            success: async data => {
                await loadTeams()
                switchTeam(data.id);
                handleSuccess(data);
                resolve(data);
            },
            error: handleError,
        });
    });
}

export function createTeamSwal() {
    return new Promise(async resolve => {
        const { value } = await Swal.fire({
            title: 'Team erstellen',
            html:
                '<input type="text" id="swal-input-title" class="swal2-input" placeholder="Titel">' +
                '<textarea id="swal-input-description" class="swal2-textarea" placeholder="Beschreibung">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Erstellen',
            cancelButtonText: 'Abbrechen',
            preConfirm: () => {
                const title = document.getElementById('swal-input-title').value;
                const description = document.getElementById('swal-input-description').value;
                
                return new Promise(async resolve => {
                    await createTeam(title, description);
                    resolve("resolved");
                })
            },
        })

        resolve(value);
    });
}

export function switchTeamConfirm() {
    window.orgatask.selected_team_id = teamswitcher.val();
    console.debug("Switched team to: " + window.orgatask.selected_team_id);
    PageLoader.exportToURL();
    PageLoader.loadPage();
}

export function switchTeam(teamid) {
    teamswitcher.val(teamid);
    switchTeamConfirm();
}

teamswitcher.on("input", () => {
    switchTeamConfirm();
});
