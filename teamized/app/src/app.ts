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
    currentPage: 'home',
    defaultTeamId: '',
    debug_prompt_accepted: false,
    selectedTeamId: '',
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

function showLoadingIndicator() {
    window.appdata.loadInProgress = true;
    $('#refreshbutton>a>i').addClass('fa-spin');
}

function hideLoadingIndicator() {
    window.appdata.loadInProgress = false;
    $('#refreshbutton>a>i').removeClass('fa-spin');
}

async function initialize() {
    if (new URL(window.location.href).searchParams.has('debug')) {
        GeneralUtils.toggleDebug(true);
    }

    showLoadingIndicator();

    NavigationService.showSidebarOnDesktop();
    NavigationService.importFromURL();
    NavigationService.render();

    await Promise.all([
        SettingsService.getSettings(),
        SettingsService.getProfile().then(NavigationService.render),
        TeamsService.getTeams(),
    ]);

    NavigationService.exportToURL();
    NavigationService.render();

    TeamsService.checkURLInvite();
    WorkingtimeService.getTrackingSession();

    hideLoadingIndicator();
    window.appdata.initialLoadComplete = true;
}

async function reinitialize() {
    showLoadingIndicator();

    const oldTeamId = window.appdata.selectedTeamId;

    window.appdata = {
        ...window.appdata,
        defaultTeamId: '',
        teamCache: {},
    };
    NavigationService.render();

    await Promise.all([SettingsService.getSettings(), TeamsService.getTeams()]);

    NavigationService.render();

    WorkingtimeService.getTrackingSession().then();

    TeamsService.switchTeam(oldTeamId);

    hideLoadingIndicator();
}

// Reload

export async function refresh() {
    if (!window.appdata.loadInProgress) {
        await reinitialize();
    }
}

function onkeypress(e: JQuery.Event) {
    if (e.key === 'F5') {
        // F5
        if (e.shiftKey) {
            // Shift+F5 normal reload
            e.preventDefault();
            window.location.reload();
        } else if (!e.ctrlKey && !e.altKey) {
            // F5 soft reload
            e.preventDefault();
            refresh().then();
        }
    } else if (e.key === 'F6' && e.shiftKey) {
        // Shift+F6 toggle debug mode
        e.preventDefault();
        GeneralUtils.toggleDebug();
    }
}

// Add event listeners

// Listen for DOM load -> initialize
$(initialize);
// Listen for navigation in the history (browser back/forward)
$(window).on('popstate', NavigationService.handleHistoryNavigation);
// Listen for F5 keypress
$(document).on('keydown', onkeypress);
