/**
 * This is the main file for the React app <br/>
 * Here the app is initialized and the main logic is started
 */

import './globals';

import $ from 'jquery';
import React from 'react';
import { createRoot } from 'react-dom/client';

import * as BaseAPI from './api/_base';
import App from './components/app';
import KeyboardListener from './components/keyboardListener';
import * as CacheService from './service/cache.service';
import * as CalendarService from './service/calendars.service';
import * as ClubService from './service/clubs.service';
import * as SettingsService from './service/settings.service';
import * as TeamsService from './service/teams.service';
import * as TodoService from './service/todo.service';
import * as WorkingtimeService from './service/workingtime.service';
import * as AlertUtils from './utils/alerts';
import { AppdataProvider } from './utils/appdataProvider';
import * as DatetimeUtils from './utils/datetime';
import * as GeneralUtils from './utils/general';
import { NavigationProvider } from './utils/navigation/navigationProvider';

// Make namespaces available in the console (for debugging)

window._App = {
    AlertUtils,
    BaseAPI,
    CacheService,
    CalendarService,
    ClubService,
    DatetimeUtils,
    SettingsService,
    TeamsService,
    TodoService,
    GeneralUtils,
    WorkingtimeService,
};

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
        <AppdataProvider>
            <NavigationProvider>
                <KeyboardListener />
                <App />
            </NavigationProvider>
        </AppdataProvider>
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

    GeneralUtils.showSidebarOnDesktop();
    render();
}

// Listen for DOM load -> initialize
$(initialize);
