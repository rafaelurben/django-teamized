/**
 * This is the main file for the React app <br/>
 * Here the app is initialized and the main logic is started
 */

import $ from 'jquery';

import * as Alerts from './utils/alerts';
import * as BaseAPI from './api/_base';
import * as Cache from './utils/cache';
import * as Calendars from './utils/calendars';
import * as Club from './utils/club';
import * as DateTime from './utils/datetime';
import * as Navigation from './utils/navigation';
import * as SettingsUtils from './utils/settings';
import * as Teams from './utils/teams';
import * as ToDo from './utils/todo';
import * as Utils from './utils/utils';
import * as WorkingTime from './utils/workingtime';
import * as WorkingTimeStats from './utils/workingtimestats';
import './globals';

// Make namespaces available in the console (for debugging)

window._App = {
    Alerts,
    BaseAPI,
    Cache,
    Calendars,
    Club,
    DateTime,
    Navigation,
    Settings: SettingsUtils,
    Teams,
    ToDo,
    Utils,
    WorkingTime,
    WorkingTimeStats,
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
        Utils.toggleDebug(true);
    }

    showLoadingIndicator();

    Navigation.showSidebarOnDesktop();
    Navigation.importFromURL();
    Navigation.render();

    await Promise.all([
        SettingsUtils.getSettings(),
        SettingsUtils.getProfile().then(Navigation.renderSidebar),
        Teams.getTeams(),
    ]);

    Navigation.exportToURL();
    Navigation.render();

    Teams.checkURLInvite();
    WorkingTime.getTrackingSession();

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
    Navigation.render();

    await Promise.all([SettingsUtils.getSettings(), Teams.getTeams()]);

    Navigation.render();

    WorkingTime.getTrackingSession().then();

    Teams.switchTeam(oldTeamId);

    hideLoadingIndicator();
}

// Reload

async function refresh() {
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
            // @ts-ignore
            window.location.reload(true);
        } else if (!e.ctrlKey && !e.altKey) {
            // F5 soft reload
            e.preventDefault();
            refresh().then();
        }
    } else if (e.key === 'F6' && e.shiftKey) {
        // Shift+F6 toggle debug mode
        e.preventDefault();
        Utils.toggleDebug();
    }
}

// Add event listeners

// Listen for DOM load -> initialize
$(initialize);
// Listen for navigation in the history (browser back/forward)
$(window).on('popstate', Navigation.handleHistoryNavigation);
// Listen for click on the sidebar toggler
$('#menubartitle').on('click', Navigation.toggleSidebar);
// Listen for click on the refresh button
$('#refreshbutton').on('click', refresh);
// Listen for F5 keypress
$(document).on('keydown', onkeypress);
