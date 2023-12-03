/**
 * This is the main file for the React app
 * Here the app is initialized and the main logic is started
 */

import $ from "jquery";

import * as Alerts from "./utils/alerts.js";
import * as API from "./utils/api.js";
import * as Cache from "./utils/cache.js";
import * as Calendars from "./utils/calendars.js";
import * as Club from "./utils/club.js";
import * as DateTime from "./utils/datetime.js";
import * as Navigation from "./utils/navigation.js";
import * as Settings from "./utils/settings.js";
import * as Teams from "./utils/teams.js";
import * as ToDo from "./utils/todo.js";
import * as Utils from "./utils/utils.js";
import * as WorkingTime from "./utils/workingtime.js";
import * as WorkingTimeStats from "./utils/workingtimestats.js";

// Make namespaces available in the console (for debugging)

window._App = {
    Alerts,
    API,
    Cache,
    Calendars,
    Club,
    DateTime,
    Navigation,
    Settings,
    Teams,
    ToDo,
    Utils,
    WorkingTime,
    WorkingTimeStats,
};

// Initialize appdata

let loadinprogress = true;

window.appdata = {
    currentPage: "home",
    defaultTeamId: null,
    selectedTeamId: null,
    teamcache: {},
    user: {
        id: null,
        username: "Laden...",
        avatar_url: "https://www.gravatar.com/avatar/",
    },
    initialLoadComplete: false,
};

function startLoading() {
    loadinprogress = true;
    $("#refreshbutton>a>i").addClass("fa-spin");
}

function endLoading() {
    loadinprogress = false;
    $("#refreshbutton>a>i").removeClass("fa-spin");
}

async function initialize() {
    if (new URL(location).searchParams.has("debug")) Utils.toggleDebug(true);

    startLoading();

    Navigation.showSidebarOnDesktop();
    Navigation.importFromURL();
    Navigation.render();

    await Promise.all([
        Settings.getSettings(),
        Settings.getProfile().then(Navigation.renderSidebar),
        Teams.getTeams(),
    ]);

    Navigation.exportToURL();
    Navigation.render();

    Teams.checkURLInvite();
    WorkingTime.getTrackingSession();

    endLoading();
    window.appdata.initialLoadComplete = true;
}

async function reinitialize() {
    startLoading();

    const oldTeamId = window.appdata.selectedTeamId;

    window.appdata = {
        ...window.appdata,
        defaultTeamId: null,
        teamcache: {},
    };
    Navigation.render();

    await Promise.all([
        Settings.getSettings(),
        Teams.getTeams(),
    ]);

    Navigation.render();

    WorkingTime.getTrackingSession();

    Teams.switchTeam(oldTeamId);

    endLoading();
}

// Reload

async function refresh() {
    if (!loadinprogress) {
        await reinitialize();
    }
}

function onkeypress(e) {
    if (e.keyCode == 116) {
        // F5
        if (e.shiftKey) {
            // Shift+F5 normal reload
            e.preventDefault();
            window.location.reload(true);
        } else if (!e.ctrlKey && !e.altKey) {
            // F5 soft reload
            e.preventDefault();
            refresh();
        }
    } else if (e.keyCode == 117 && e.shiftKey) {
        // Shift+F6 toggle debug mode
        e.preventDefault();
        Utils.toggleDebug();
    }
}

// Add event listeners

// Listen for page load -> initialize
$("document").ready(initialize);
// Listen for navigation in the history (browser back/forward)
$(window).bind("popstate", Navigation.handleHistoryNavigation);
// Listen for click on the sidebar toggler
$("#menubartitle").click(Navigation.toggleSidebar);
// Listen for click on the refresh button
$("#refreshbutton").click(refresh);
// Listen for F5 keypress
$(document).keydown(onkeypress);
