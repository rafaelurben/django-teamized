const maincontent = $('#maincontent');

export function exportToURL() {
    var url = new URL(window.location);
    url.searchParams.set('page', window.orgatask.current_page);
    url.searchParams.set('selected_org_id', window.orgatask.selected_org_id);

    window.history.pushState(
        {},
        "OrgaTask",
        url.href,
    );
}

export function importFromURL() {
    const url = new URL(window.location);
    window.orgatask.current_page = url.searchParams.get('page');
    window.orgatask.selected_org_id = url.searchParams.get('selected_org_id');
}
