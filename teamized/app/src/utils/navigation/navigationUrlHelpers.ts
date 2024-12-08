import { NavigationState } from './navigationState';

const SHORT_KEYS = {
    selectedPage: 'p',
    selectedTeamId: 't',
};

export function importNavigationStateFromURL() {
    const searchParams = new URL(window.location.href).searchParams;

    const state: NavigationState = {
        selectedPage: searchParams.get('p') || 'home',
        selectedTeamId: searchParams.get('t') || window.appdata.defaultTeamId,
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
        if (!window.appdata.initialLoadComplete) {
            // Replace the current history entry with the new options (keeps the last page in the history for the back button)
            // This is done to prevent the back button from looping back to the same page on the initial load
            window.history.replaceState(null, '', newURL.href);
        } else {
            // Add a new history entry (allows the user to use the back button to go back to the current state)
            window.history.pushState(null, '', newURL.href);
        }
    }
}
