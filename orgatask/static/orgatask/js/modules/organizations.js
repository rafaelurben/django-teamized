import { handleError } from './utils.js';
import * as PageLoader from './page-loader.js';

const orgswitcher = $('#orgswitcher');

export function loadOrgs() {
    return new Promise(resolve => {
        $.getJSON({
            url: document.api_base_url + 'organizations', 
            success: function(data) {
                orgswitcher.empty();

                window.orgatask.organizations = data.organizations;
                window.orgatask.default_org_id = data.default_org_id;
                if (!window.orgatask.selected_org_id) {
                    // No org selected; select default
                    window.orgatask.selected_org_id = data.default_org_id;
                } else {
                    // Org selected; check if it is valid
                    var validated = false;
                    window.orgatask.organizations.forEach(org => {
                        if (org.id === window.orgatask.selected_org_id) {
                            validated = true;
                        }
                    });
                    if (!validated) {
                        // Org not valid; fall back to default
                        window.orgatask.selected_org_id = data.default_org_id;
                    }
                }

                window.orgatask.organizations.forEach(org => {
                    if (org.id === window.orgatask.selected_org_id) {
                        orgswitcher.append(`<option selected value="${org.id}">${org.title}</option>`);
                    } else {
                        orgswitcher.append(`<option value="${org.id}">${org.title}</option>`);
                    }
                });

                resolve('resolved');
            },
            error: handleError,
        });
    });
}

export function createOrg(title, description) {
    return new Promise(resolve => {
        $.ajax({
            url: document.api_base_url + 'organizations',
            type: 'POST',
            data: {
                title: title,
                description: description,
            },
            success: async data => {
                await loadOrgs()
                switchOrg(data.id);
                resolve(data);
            },
            error: handleError,
        });
    });
}

export function createOrgSwal() {
    return new Promise(async resolve => {
        const { value } = await Swal.fire({
            title: 'Multiple inputs',
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
                    await createOrg(title, description);
                    resolve("resolved");
                })
            },
        })

        resolve(value);
    });
}

export function switchOrgConfirm() {
    window.orgatask.selected_org_id = orgswitcher.val();
    console.debug("Switched organization to: " + window.orgatask.selected_org_id);
    PageLoader.exportToURL();
    PageLoader.loadPage();
}

export function switchOrg(orgid) {
    orgswitcher.val(orgid);
    switchOrgConfirm();
}

orgswitcher.on("input", () => {
    switchOrgConfirm();
});
