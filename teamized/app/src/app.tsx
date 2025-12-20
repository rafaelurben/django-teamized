/**
 * This is the main file for the React app <br/>
 * Here the app is initialized and the main logic is started
 */

import './globals';
import './styles/globals.css';

import $ from 'jquery';
import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './components/app';
import KeyboardListener from './components/keyboardListener';
import { AppdataProvider } from './utils/appdataProvider';
import * as GeneralUtils from './utils/general';
import { NavigationProvider } from './utils/navigation/navigationProvider';
import { setupCSRFToken } from './utils/security';

// Initialize appdata

window.appdata = {
    defaultTeamId: '',
    debug_prompt_accepted: false,
    teamCache: {},
    user: {
        id: '',
        username: 'Laden...',
        avatar_url: 'https://www.gravatar.com/avatar/',
        email: '',
        first_name: '',
        last_name: '',
    },
    settings: {
        darkmode: true,
    },
    initialLoadComplete: false,
    loadInProgress: true,
};

const rootElem = document.getElementById('react-root')!;
let root = createRoot(rootElem);

export function render() {
    root.render(
        <React.StrictMode>
            <AppdataProvider>
                <NavigationProvider>
                    <KeyboardListener />
                    <App />
                </NavigationProvider>
            </AppdataProvider>
        </React.StrictMode>
    );
}

export function reRender() {
    root.unmount();
    root = createRoot(rootElem);
    render();
}

export function softRefresh() {
    if (!window.appdata.loadInProgress) {
        window.appdata = {
            ...window.appdata,
            loadInProgress: true,
            defaultTeamId: '',
            teamCache: {},
        };
        reRender();
    }
}

async function initialize() {
    if (new URL(window.location.href).searchParams.has('debug')) {
        GeneralUtils.toggleDebug(true);
    }

    setupCSRFToken();

    GeneralUtils.showSidebarOnDesktop();
    render();
}

// Listen for DOM load -> initialize
$(initialize);
