/**
 * Module for navigation, routing and rendering
 */

import { createRoot } from 'react-dom/client';
import React from 'react';

import { PageLoader, PAGE_LIST, PAGE_NAMES } from '../components/pageloader';
import AppMenubar from '../components/menubar';
import AppSidebar from '../components/sidebar';
import * as Teams from './teams';
import { getCurrentTeamData } from './cache';

const rootSidebar = createRoot(document.getElementById('app-sidebar')!);
const rootMenubar = createRoot(document.getElementById('app-menubar')!);
const rootPage = createRoot(document.getElementById('app-maincontent')!);

function ensureExistingPage() {
    if (!PAGE_LIST.includes(window.appdata.currentPage)) {
        window.appdata.currentPage = PAGE_LIST[0];
    }
}

function updatePageTitle() {
    const teamName = getCurrentTeamData().team.name;
    const pageName = PAGE_NAMES[window.appdata.currentPage];
    document.title = `${pageName} - ${teamName} | Teamized App`;
}

/**
 * Export changes from the cache to the URL
 */
export function exportToURL(options?: {
    additionalParams?: { [key: string]: string };
    removeParams?: string[];
}) {
    ensureExistingPage();
    Teams.ensureExistingTeam();

    const oldurl = new URL(window.location.href);
    const newurl = new URL(window.location.href);

    // Export the pagename and teamid to the URL
    newurl.searchParams.set('p', window.appdata.currentPage);
    newurl.searchParams.set('t', window.appdata.selectedTeamId);

    if (options) {
        const { additionalParams = {}, removeParams = [] } = options;

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
        const args: [object, string, string] = [
            {
                page: window.appdata.currentPage,
                selectedTeamId: window.appdata.selectedTeamId,
            },
            '',
            newurl.href,
        ];

        if (!window.appdata.initialLoadComplete) {
            // Replace the current history entry with the new options (keeps the last page in the history for the back button)
            // This is done to prevent the back button from looping back to the same page on the initial load
            window.history.replaceState(...args);
        } else {
            // Add a new history entry (allows the user to use the back button to go back to the current state)
            window.history.pushState(...args);
        }
    }

    updatePageTitle();
}

/**
 * Import the pagename and teamid from the URL
 */
export function importFromURL() {
    const url = new URL(window.location.href);
    window.appdata.currentPage = url.searchParams.get('p') || '';
    window.appdata.selectedTeamId = url.searchParams.get('t') || '';
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
    rootSidebar.render(
        <AppSidebar
            selectedPage={window.appdata.currentPage}
            user={window.appdata.user}
            isAdmin={Teams.isCurrentTeamAdmin()}
            isClubEnabled={Teams.hasCurrentTeamLinkedClub()}
            onPageSelect={selectPage}
        />
    );
}

export function renderPage() {
    rootPage.render(<PageLoader page={window.appdata.currentPage} />);
}

export function renderMenubar() {
    rootMenubar.render(
        <AppMenubar
            teams={Teams.getTeamsList()}
            selectedTeamId={window.appdata.selectedTeamId}
            onTeamSelect={Teams.switchTeam}
            onPageSelect={selectPage}
        />
    );
}

export function render() {
    renderMenubar();
    renderSidebar();
    renderPage();
}

export function reRender() {
    rootPage.unmount();
    rootSidebar.unmount();
    rootMenubar.unmount();
    render();
}

/**
 * Change the current page (and render it)
 */
export function selectPage(page: string) {
    if (PAGE_LIST.includes(page)) {
        window.appdata.currentPage = page;
        exportToURL();
        render();
        hideSidebarOnMobile();
    } else {
        console.error('Invalid page: ' + page);
    }
}

/**
 * Handle the browser back and forward buttons
 */
export function handleHistoryNavigation() {
    console.log('Navigated in history! Switching page...');
    importFromURL();
    ensureExistingPage();
    Teams.ensureExistingTeam();
    render();
    updatePageTitle();
}
