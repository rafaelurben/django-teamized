import { NavigationState } from './navigationState';

const LOCAL_STORAGE_KEY = 'teamized_navigation_state';

export function getNavigationStateFromLocalStorage(): NavigationState | null {
    const state = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!state) {
        return null;
    }
    try {
        return JSON.parse(state);
    } catch (e) {
        console.error(
            '[Teamized] Failed to parse navigation state from localStorage:',
            e
        );
        return null;
    }
}

export function saveNavigationStateToLocalStorage(state: NavigationState) {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error(
            '[Teamized] Failed to save navigation state to localStorage:',
            e
        );
    }
}
