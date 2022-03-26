import * as Teams from '../teams.js';
import * as PageLoader from '../page-loader.js';


async function handleButtonClick(event) {
    var button = event.target;
    var action = button.dataset.action;
    var teamid = button.dataset.id;
    
    if (action === "change_to") {
        Teams.switchTeam(teamid);
    } else if (action === "manage") {

    } else if (action === "leave") {

    } else if (action === "create") {
        await Teams.createTeamSwal("Testname", "Testdescription");
        await Teams.loadTeams();
        PageLoader.loadPage();
    }
}

export default function buildPage(container) {
    console.debug("loaded pages/teamlist.js");

    const table = $('<table class="table table-borderless align-middle"></table>');
    window.orgatask.teams.forEach(team => {
        var tr = $(`<tr></tr>`);

        tr.append($(
            `<td class="py-2">` +
            `<b>${team.title}</b><br>` +
            `<span>${team.description}</span>` +
            `</td>`
        ));

        tr.append($(
            `<td>` +
            `<b>${team.member.role_text}</b>` +
            `</td>`
        ));

        if (team.id !== window.orgatask.selectedTeamId) {
            tr.append($(
                `<td>` +
                `<a href="#" class="btn btn-outline-success border-1" data-id="${team.id}" data-action="change_to">Wechseln zu</a>` +
                `</td>`
            ));
        } else {
            tr.append($("<td></td>"));
        }

        if (team.member.role === "owner" || team.member.role === "admin") {
            tr.append($(
                `<td>` +
                `<a href="#" class="btn btn-outline-dark border-1" data-id="${team.id}" data-action="manage">Verwalten</a>` +
                `</td>`
            ));
        } else {
            tr.append($("<td></td>"));
        }

        if (team.member.role !== "owner") {
            tr.append($(
                `<td>` +
                `<a href="#" class="btn btn-outline-danger border-1" data-id="${team.id}" data-action="leave">Verlassen</a>` +
                `</td>`
            ));
        } else {
            tr.append($("<td></td>"));
        }

        table.append(tr);
    });
    container.append(table)

    container.append($(`
        <div class="w-100 border border-dark rounded p-2">
            <span class="mx-3">Neues Team:</span>
            <a href="#" class="m-2 btn btn-outline-primary border-1" data-action="create">Team erstellen</a>
        </div>`))

    $("#maincontent a[data-action]").click(handleButtonClick);
}
