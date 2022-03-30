import loadPageTeamlist from '../orgatask_modules/pages/teamlist.js';

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

    // Export the pagename and teamid to the URL

    var oldurl = new URL(window.location);
    var newurl = new URL(window.location);
    newurl.searchParams.set('p', window.orgatask.currentPage);
    newurl.searchParams.set('t', window.orgatask.selectedTeamId);

    if (oldurl.href !== newurl.href) {
        // Add page to history if the URL has changed (i.e. changed the page url)
        window.history.pushState(
            {
                page: window.orgatask.currentPage,
                selectedTeamId: window.orgatask.selectedTeamId,
            },
            "OrgaTask",
            newurl.href,
        );
    }
}

export function importFromURL() {
    // Import the pagename and teamid from the URL

    const url = new URL(window.location);
    window.orgatask.currentPage = url.searchParams.get('p');
    window.orgatask.selectedTeamId = url.searchParams.get('t');

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
