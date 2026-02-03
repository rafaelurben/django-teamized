import { NavigationState } from './navigationState';
import {
    getNavigationStateFromLocalStorage,
    saveNavigationStateToLocalStorage,
} from './navigationStorageHelpers';

const SHORT_KEYS: { [key: string]: string | undefined } = {
    selectedPage: 'p',
    selectedTeamId: 't',
};

export function importNavigationStateFromURL() {
    const searchParams = new URL(window.location.href).searchParams;
    const defaultState = getNavigationStateFromLocalStorage() || {
        selectedPage: 'home',
        selectedTeamId: window.appdata.defaultTeamId,
    };

    const state: NavigationState = {
        selectedPage: searchParams.get('p') || defaultState.selectedPage,
        selectedTeamId: searchParams.get('t') || defaultState.selectedTeamId,
    };

    for (const [k, v] of searchParams.entries()) {
        if (k !== 'p' && k !== 't') {
            state[k] = v;
        }
    }

    return state;
}

export function getUpdatedURLWithNavigationState(state: NavigationState) {
    const searchParams = new URLSearchParams();

    for (const [k, v] of Object.entries(state)) {
        searchParams.set(SHORT_KEYS[k] || k, v);
    }

    const url = new URL(window.location.href);
    url.search = searchParams.toString();
    return url;
}

export function exportNavigationStateToURL(state: NavigationState) {
    const oldURL = new URL(window.location.href);
    const newURL = getUpdatedURLWithNavigationState(state);

    // If the URL has changed, update the URL
    if (oldURL.href !== newURL.href) {
        if (window.appdata.initialLoadComplete) {
            // Add a new history entry (allows the user to use the back button to go back to the current state)
            window.history.pushState(null, '', newURL.href);
        } else {
            // Replace the current history entry with the new options (keeps the last page in the history for the back button)
            // This is done to prevent the back button from looping back to the same page on the initial load
            window.history.replaceState(null, '', newURL.href);
        }
    }

    saveNavigationStateToLocalStorage(state);
}
