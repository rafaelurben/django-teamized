import * as Organizations from '../organizations.js';
import * as PageLoader from '../page-loader.js';


async function handleButtonClick(event) {
    var button = event.target;
    var action = button.dataset.action;
    var org_id = button.dataset.id;
    
    if (action === "change_to") {
        Organizations.switchOrg(org_id);
    } else if (action === "manage") {

    } else if (action === "leave") {

    } else if (action === "create") {
        await Organizations.createOrgSwal("Testname", "Testdescription");
        await Organizations.loadOrgs();
        PageLoader.loadPage();
    }
}

export default function buildPage(container) {
    console.debug("loaded pages/orglist.js");

    const table = $('<table class="table table-borderless align-middle"></table>');
    window.orgatask.organizations.forEach(org => {
        var tr = $(`<tr></tr>`);

        tr.append($(
            `<td class="py-2">` +
            `<b>${org.title}</b><br>` +
            `<span>${org.description}</span>` +
            `</td>`
        ));

        tr.append($(
            `<td>` +
            `<b>${org.member.role_text}</b>` +
            `</td>`
        ));

        if (org.id !== window.orgatask.selected_org_id) {
            tr.append($(
                `<td>` +
                `<a href="#" class="btn btn-outline-success border-1" data-id="${org.id}" data-action="change_to">Wechseln zu</a>` +
                `</td>`
            ));
        } else {
            tr.append($("<td></td>"));
        }

        if (org.member.role === "owner" || org.member.role === "admin") {
            tr.append($(
                `<td>` +
                `<a href="#" class="btn btn-outline-dark border-1" data-id="${org.id}" data-action="manage">Verwalten</a>` +
                `</td>`
            ));
        } else {
            tr.append($("<td></td>"));
        }

        if (org.member.role !== "owner") {
            tr.append($(
                `<td>` +
                `<a href="#" class="btn btn-outline-danger border-1" data-id="${org.id}" data-action="leave">Verlassen</a>` +
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
            <span class="mx-3">Neue Organisation:</span>
            <a href="#" class="m-2 btn btn-outline-primary border-1" data-action="create">Organisation erstellen</a>
        </div>`))

    $("#maincontent a[data-action]").click(handleButtonClick);
}
