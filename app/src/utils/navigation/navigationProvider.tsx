import React, { createContext, useContext, useEffect, useReducer } from 'react';

import { ID } from '@/teamized/interfaces/common';
import { useAppdata } from '@/teamized/utils/appdataProvider';

import { NavigationState, NavigationStateChange } from './navigationState';
import {
    exportNavigationStateToURL,
    getUpdatedURLWithNavigationState,
    importNavigationStateFromURL,
} from './navigationUrlHelpers';

const NavigationStateContext = createContext<NavigationState>({
    selectedPage: 'home',
    selectedTeamId: '',
});
const NavigationStateDispatchContext = createContext<
    React.Dispatch<NavigationStateChange>
>(() => {});

interface Props {
    children: React.ReactNode;
}

export function NavigationProvider({ children }: Readonly<Props>) {
    const [navigationState, dispatch] = useReducer(
        navigationStateReducer,
        importNavigationStateFromURL()
    );

    useEffect(() => {
        console.debug('[Teamized] Navigation state changed: ', navigationState);
        exportNavigationStateToURL(navigationState);
    }, [navigationState]);

    useEffect(() => {
        const handleBrowserHistoryNavigation = () => {
            const state = importNavigationStateFromURL();
            console.debug('[Teamized] History navigation detected!');
            dispatch({ type: 'replace', state: state });
        };

        window.addEventListener('popstate', handleBrowserHistoryNavigation);
        return () => {
            window.removeEventListener(
                'popstate',
                handleBrowserHistoryNavigation
            );
        };
    }, []);

    return (
        <NavigationStateContext.Provider value={navigationState}>
            <NavigationStateDispatchContext.Provider value={dispatch}>
                {children}
            </NavigationStateDispatchContext.Provider>
        </NavigationStateContext.Provider>
    );
}

function navigationStateReducer(
    navigationState: NavigationState,
    navigationStateChange: NavigationStateChange
): NavigationState {
    if (navigationStateChange.type === 'replace') {
        return navigationStateChange.state;
    }

    const newState: NavigationState = {
        ...navigationState,
    };

    if (navigationStateChange.update) {
        for (const [k, v] of Object.entries(navigationStateChange.update)) {
            newState[k] = v!;
        }
    }
    if (navigationStateChange.remove) {
        for (const k of navigationStateChange.remove) {
            delete newState[k];
        }
    }

    return newState;
}

export function useNavigationState() {
    return useContext(NavigationStateContext);
}

export function useNavigationStateDispatch() {
    return useContext(NavigationStateDispatchContext);
}

export function useNavigationStateDispatchURLPreview() {
    const state = useNavigationState();
    return (change: NavigationStateChange) => {
        const newState = navigationStateReducer(state, change);
        const newURL = getUpdatedURLWithNavigationState(newState);
        return newURL.href;
    };
}

/**
 * The returned function takes a page name and navigates to the corresponding page.
 */
export function usePageNavigator() {
    const dispatch = useNavigationStateDispatch();
    return (pageName: string) => {
        return dispatch({ update: { selectedPage: pageName } });
    };
}

/**
 * The returned function takes a page name and returns an event handler that navigates to the corresponding page
 */
export function usePageNavigatorAsEventHandler() {
    const dispatch = usePageNavigator();
    return (page: string) => (e: React.UIEvent) => {
        e.preventDefault();
        dispatch(page);
    };
}

/**
 * The returned function takes a page name and returns an URL to navigate to that page.
 */
export function usePageNavigatorURL() {
    const preview = useNavigationStateDispatchURLPreview();
    return (pageName: string) => {
        return preview({ update: { selectedPage: pageName } });
    };
}

/**
 * The returned function takes a team id and navigates to the corresponding team.
 */
export function useTeamSwitcher() {
    const dispatch = useNavigationStateDispatch();
    return (teamId: ID) => {
        return dispatch({ update: { selectedTeamId: teamId } });
    };
}

export function useCurrentTeamData() {
    const { selectedTeamId } = useNavigationState();
    const appdata = useAppdata();
    return appdata.teamCache[selectedTeamId] || null;
}
