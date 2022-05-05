import PageLoader from "../components/pageloader.js";
import AppMenubar from "../components/menubar.js";
import * as Teams from './teams.js';


const pageList = [
    "teamlist",
    "teammanage",
]

function ensureExistingPage() {
    if (!pageList.includes(window.orgatask.currentPage)) {
        window.orgatask.currentPage = pageList[0];
    }
}

export function exportToURL() {
    ensureExistingPage();
    Teams.ensureExistingTeam();

    // Export the pagename and teamid to the URL

    var oldurl = new URL(window.location);
    var newurl = new URL(window.location);
    newurl.searchParams.set('p', window.orgatask.currentPage);
    newurl.searchParams.set('t', window.orgatask.selectedTeamId);

    if (oldurl.href !== newurl.href) {
        // Add page to history if the URL has changed 
        // (i.e. update the page url if there's something to change)
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
}

export function renderPage() {
    let data = window.orgatask;
    ReactDOM.render(
        <PageLoader
            page={data.currentPage}
            data={data}
        />,
        document.getElementById("maincontent")
    );
}

export function selectPage(page) {
    console.debug("Select page: " + page);
    window.orgatask.currentPage = page;
    exportToURL();
    renderPage();
}

export function renderMenubar() {
    let data = window.orgatask;
    ReactDOM.render(
        <AppMenubar
            teams={data.teams}
            selectedTeamId={data.selectedTeamId}
            onTeamSelect={Teams.switchTeam}
            onPageSelect={selectPage}
        />,
        document.getElementById("orgatask_appmenubar")
    );
}

export function handleHistoryNavigation() {
    console.log("Navigated in history! Switching page...");
    importFromURL();
    ensureExistingPage();
    Teams.ensureExistingTeam();
    renderMenubar(); // only render the menubar because refetching the teams takes too much time
    renderPage();
}