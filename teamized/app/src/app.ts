/**
 * This is the main file for the React app <br/>
 * Here the app is initialized and the main logic is started
 */

import './globals';

import $ from 'jquery';

import * as BaseAPI from './api/_base';
import * as CacheService from './service/cache.service';
import * as CalendarService from './service/calendars.service';
import * as ClubService from './service/clubs.service';
import * as NavigationService from './service/navigation.service';
import * as SettingsService from './service/settings.service';
import * as TeamsService from './service/teams.service';
import * as TodoService from './service/todo.service';
import * as WorkingtimeService from './service/workingtime.service';
import * as AlertUtils from './utils/alerts';
import * as DatetimeUtils from './utils/datetime';
import * as GeneralUtils from './utils/general';

// Make namespaces available in the console (for debugging)

window._App = {
    AlertUtils,
    BaseAPI,
    CacheService,
    CalendarService,
    ClubService,
    DatetimeUtils,
    NavigationService,
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

async function initialize() {
    if (new URL(window.location.href).searchParams.has('debug')) {
        GeneralUtils.toggleDebug(true);
    }

    NavigationService.showSidebarOnDesktop();
    NavigationService.render();
}

// Listen for DOM load -> initialize
$(initialize);
