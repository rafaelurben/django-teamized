import PageLoader from "../components/pageloader.js";
import AppMenubar from "../components/menubar.js";
import AppSidebar from "../components/sidebar.js";
import * as Utils from './utils.js';
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

export function exportToURL(options) {
    ensureExistingPage();
    Teams.ensureExistingTeam();

    const oldurl = new URL(window.location);
    var newurl = new URL(window.location);
    
    // Export the pagename and teamid to the URL
    newurl.searchParams.set('p', window.orgatask.currentPage);
    newurl.searchParams.set('t', window.orgatask.selectedTeamId);

    if (options) {
        let additionalParams;
        let removeParams;

        ({additionalParams = {}, removeParams = [] } = options);

        // Add the additional parameters
        for (const key in additionalParams) {
            newurl.searchParams.set(key, additionalParams[key]);
        }
    
        // Remove parameters
        for (const index in removeParams) {
            newurl.searchParams.delete(removeParams[index]);
        }
    }

    // If the URL has changed, update the URL
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

export function toggleSidebar() {
    document.getElementById('orgatask_app').classList.toggle('sidebar-visible');
}

export function hideSidebarOnMobile() {
    if (window.innerWidth < 992) {
        document.getElementById('orgatask_app').classList.remove('sidebar-visible');
    }
}

export function renderSidebar() {
    ReactDOM.render(
        <AppSidebar
            page={window.orgatask.currentPage}
            user={{
                username: window.orgatask.user.username,
                avatarUrl: Utils.getGravatarUrl(window.orgatask.user.email),
                isAdmin: Teams.isCurrentTeamAdmin(),
            }}
            onPageSelect={selectPage}
        />,
        document.getElementById("orgatask_appsidebar")
    );
}

export function renderPage() {
    ReactDOM.render(
        <PageLoader
            page={window.orgatask.currentPage}
        />,
        document.getElementById("orgatask_maincontent")
    );
    renderSidebar();
}

export function renderMenubar() {
    ReactDOM.render(
        <AppMenubar
            teams={Teams.getTeamsList()}
            selectedTeamId={window.orgatask.selectedTeamId}
            onTeamSelect={Teams.switchTeam}
            onPageSelect={selectPage}
        />,
        document.getElementById("orgatask_appmenubar")
    );
    renderSidebar();
}

export function selectPage(page) {
    console.debug("Select page: " + page);
    window.orgatask.currentPage = page;
    exportToURL();
    renderPage();
    hideSidebarOnMobile();
}

export function handleHistoryNavigation() {
    console.log("Navigated in history! Switching page...");
    importFromURL();
    ensureExistingPage();
    Teams.ensureExistingTeam();
    renderMenubar(); // only render the menubar because refetching the teams takes too much time
    renderPage();
}
