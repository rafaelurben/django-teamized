import loadPageTeamlist from './pages/teamlist.js';

const maincontent = $('#maincontent');

const pageList = [
    "teamlist",
    "settings",
]

function ensureExistingPage() {
    if (!pageList.includes(window.orgatask.currentPage)) {
        window.orgatask.currentPage = pageList[0];
    }
}

export function exportToURL() {
    ensureExistingPage();

    var url = new URL(window.location);
    url.searchParams.set('page', window.orgatask.currentPage);
    url.searchParams.set('selectedTeamId', window.orgatask.selectedTeamId);

    window.history.pushState(
        {
            page: window.orgatask.currentPage,
            selectedTeamId: window.orgatask.selectedTeamId,
        },
        "OrgaTask",
        url.href,
    );
}

export function importFromURL() {
    const url = new URL(window.location);
    window.orgatask.currentPage = url.searchParams.get('page');
    window.orgatask.selectedTeamId = url.searchParams.get('selectedTeamId');

    ensureExistingPage();
}

export function loadPage() {
    maincontent.empty();

    switch (window.orgatask.currentPage) {
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
    window.orgatask.currentPage = page;
    exportToURL();
    loadPage();
}
