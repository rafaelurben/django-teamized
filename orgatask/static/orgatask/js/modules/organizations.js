const orgswitcher = $('#orgswitcher');

export function loadOrgs() {
    return new Promise(resolve => {
        $.getJSON(document.api_base_url + 'organizations', function(data) {
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
        });
    });
}

export function updateSelectedOrg() {
    window.orgatask.selected_org_id = orgswitcher.val();
}

export function switchOrg(orgid) {
    orgswitcher.val(orgid);
}
