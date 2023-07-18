/**
 * Module for navigation, routing and rendering
 */

import { PageLoader, PAGELIST } from "../components/pageloader.js";
import AppMenubar from "../components/menubar.js";
import AppSidebar from "../components/sidebar.js";
import * as Teams from './teams.js';


function ensureExistingPage() {
    if (!PAGELIST.includes(window.appdata.currentPage)) {
        window.appdata.currentPage = PAGELIST[0];
    }
}

/**
 * Export changes from the cache to the URL
 * 
 * @param {object} options 
 */
export function exportToURL(options) {
    ensureExistingPage();
    Teams.ensureExistingTeam();

    const oldurl = new URL(window.location);
    var newurl = new URL(window.location);
    
    // Export the pagename and teamid to the URL
    newurl.searchParams.set('p', window.appdata.currentPage);
    newurl.searchParams.set('t', window.appdata.selectedTeamId);

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
        let args = [
            {
                page: window.appdata.currentPage,
                selectedTeamId: window.appdata.selectedTeamId,
            },
            "",
            newurl.href,
        ]

        if (!window.appdata.initialLoadComplete) {
            // Replace the current history entry with the new options (keeps the last page in the history for the back button)
            // This is done to prevent the back button from looping back to the same page on the initial load
            window.history.replaceState(...args);
        } else {
            // Add a new history entry (allows the user to use the back button to go back to the current state)
            window.history.pushState(...args);
        }
    }
}

/**
 * Import changes from the URL to the cache
 */
export function importFromURL() {
    // Import the pagename and teamid from the URL

    const url = new URL(window.location);
    window.appdata.currentPage = url.searchParams.get('p');
    window.appdata.selectedTeamId = url.searchParams.get('t');
}

export function toggleSidebar() {
    document.body.classList.toggle('sidebar-visible');
}

export function hideSidebarOnMobile() {
    if (window.innerWidth < 992) {
        document.body.classList.remove('sidebar-visible');
    }
}

export function showSidebarOnDesktop() {
    if (window.innerWidth >= 992) {
        document.body.classList.add('sidebar-visible');
    }
}

export function renderSidebar() {
    ReactDOM.render(
        <AppSidebar
            page={window.appdata.currentPage}
            user={window.appdata.user}
            isAdmin={Teams.isCurrentTeamAdmin()}
            isClubEnabled={Teams.hasCurrentTeamLinkedClub()}
            onPageSelect={selectPage}
        />,
        document.getElementById("app-sidebar")
    );
}

export function renderPage() {
    ReactDOM.render(
        <PageLoader
            page={window.appdata.currentPage}
        />,
        document.getElementById("app-maincontent")
    );
}

export function renderMenubar() {
    ReactDOM.render(
        <AppMenubar
            teams={Teams.getTeamsList()}
            selectedTeamId={window.appdata.selectedTeamId}
            onTeamSelect={Teams.switchTeam}
            onPageSelect={selectPage}
        />,
        document.getElementById("app-menubar")
    );
}

export function render() {
    renderMenubar();
    renderSidebar();
    renderPage();
}

export function reRender() {
    ReactDOM.unmountComponentAtNode(
        document.getElementById("app-menubar")
    )
    ReactDOM.unmountComponentAtNode(
        document.getElementById("app-maincontent")
    )
    ReactDOM.unmountComponentAtNode(
        document.getElementById("app-sidebar")
    )
    render();
}

/**
 * Change the current page (and render it)
 * 
 * @param {String} page 
 */
export function selectPage(page) {
    if (PAGELIST.includes(page)) {
        window.appdata.currentPage = page;
        exportToURL();
        render();
        hideSidebarOnMobile();
    } else {
        console.error("Invalid page: " + page);
    }
}

/**
 * Handle the browser back and forward buttons
 */
export function handleHistoryNavigation() {
    console.log("Navigated in history! Switching page...");
    importFromURL();
    ensureExistingPage();
    Teams.ensureExistingTeam();
    render();
}
