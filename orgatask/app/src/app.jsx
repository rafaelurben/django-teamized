import * as Alerts from "./utils/alerts.js";
import * as API from "./utils/api.js";
import * as Cache from "./utils/cache.js";
import * as Navigation from "./utils/navigation.js";
import * as Teams from "./utils/teams.js";
import * as Utils from "./utils/utils.js";

// Make namespaces available in the console (for debugging)

  window._OrgaTask = {
    Alerts,
    API,
    Cache,
    Navigation,
    Teams,
    Utils,
  };

// Initialize empty data object

function initialize() {

  window.orgatask = {
    currentPage: "teamlist",
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

initialize();

// Perform tasks after page load

$("document").ready(async function () {
  Navigation.hideSidebarOnMobile();
  Navigation.renderMenubar();
  Navigation.importFromURL();
  window.orgatask.user = await Teams.getProfile();
  Navigation.renderSidebar();
  await Teams.loadTeams(true); // Load teams from API and build cache
  Navigation.exportToURL();
  Navigation.renderPage();
});

// Add event listener for page navigation

$(window).bind("popstate", Navigation.handleHistoryNavigation);
$("#menubartitle").click(Navigation.toggleSidebar);
