import loadPageTeamlist from './pages/teamlist.js';

const maincontent = $('#maincontent');

const pageList = [
    "teamlist",
    "settings",
]

function ensureExistingPage() {
    if (!pageList.includes(window.orgatask.current_page)) {
        window.orgatask.current_page = pageList[0];
    }
}

export function exportToURL() {
    ensureExistingPage();

    var url = new URL(window.location);
    url.searchParams.set('page', window.orgatask.current_page);
    url.searchParams.set('selected_team_id', window.orgatask.selected_team_id);

    window.history.pushState(
        {},
        "OrgaTask",
        url.href,
    );
}

export function importFromURL() {
    const url = new URL(window.location);
    window.orgatask.current_page = url.searchParams.get('page');
    window.orgatask.selected_team_id = url.searchParams.get('selected_team_id');

    ensureExistingPage();
}

export function loadPage() {
    maincontent.empty();

    switch (window.orgatask.current_page) {
        case 'teamlist':
            loadPageTeamlist(maincontent);
            break;
        case 'settings':
            console.debug("LOAD SETTINGS page");
            break;
        default: 
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Seite wurde nicht gefunden.",
            })
    }
}

export function selectPage(page) {
    console.debug("Select page: " + page);
    window.orgatask.current_page = page;
    exportToURL();
    loadPage();
}

$("a[data-page]").click(e => {
    selectPage(e.currentTarget.dataset.page);
});
