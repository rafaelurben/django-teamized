/**
 * Module for navigation, routing and rendering
 */

import React from 'react';
import { createRoot } from 'react-dom/client';

import App from '../components/App';
import { PAGE_LIST, PAGE_NAMES } from '../components/pageloader';
import { getCurrentTeamData } from './cache.service';
import * as TeamsService from './teams.service';

const root = createRoot(document.getElementById('react-root')!);

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
    TeamsService.ensureExistingTeam();

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

export function render() {
    root.render(<App />);
}

export function reRender() {
    root.unmount();
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
    TeamsService.ensureExistingTeam();
    render();
    updatePageTitle();
}
