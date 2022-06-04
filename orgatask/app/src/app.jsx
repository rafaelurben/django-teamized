import * as Alerts from "./utils/alerts.js";
import * as API from "./utils/api.js";
import * as Cache from "./utils/cache.js";
import * as Navigation from "./utils/navigation.js";
import * as Teams from "./utils/teams.js";
import * as Utils from "./utils/utils.js";
import * as WorkingTime from "./utils/workingtime.js";

// Make namespaces available in the console (for debugging)

window._OrgaTask = {
    Alerts,
    API,
    Cache,
    Navigation,
    Teams,
    Utils,
    WorkingTime,
};

// Initialize

function initialize_data_object() {
    window.orgatask = {
        currentPage: "home",
        defaultTeamId: null,
        selectedTeamId: null,
        teamcache: {},
        user: {
            id: null,
            username: "loading...",
            email: "loading...",
        },
    };
}

initialize_data_object();

async function initialize() {
    initialize_data_object();

    Navigation.hideSidebarOnMobile();
    Navigation.renderMenubar();
    Navigation.importFromURL();
    window.orgatask.user = await Teams.getProfile();
    Navigation.renderSidebar();
    await Teams.loadTeams(true); // Load teams from API and build cache
    Navigation.exportToURL();
    Navigation.renderPage();

    Teams.checkURLInvite();
    WorkingTime.getTrackingSession();
}

// Add event listeners

// Listen for page load -> initialize
$("document").ready(initialize);
// Listen for navigation in the history (browser back/forward)
$(window).bind("popstate", Navigation.handleHistoryNavigation);
// Listen for click on the sidebar toggler
$("#menubartitle").click(Navigation.toggleSidebar);
