import * as Alerts from "./utils/alerts.js";
import * as API from "./utils/api.js";
import * as Navigation from "./utils/navigation.js";
import * as Teams from "./utils/teams.js";

// Initialize empty data object

window.orgatask = {
  teams: [],
  selectedTeamId: null,
  defaultTeamId: null,
};

// Make namespaces available in the console (for debugging)

window._OrgaTask = {
  Alerts,
  API,
  Navigation,
  Teams,
};

// Perform tasks after page load

$("document").ready(async function () {
  Navigation.renderMenubar();
  Navigation.importFromURL();
  await Teams.loadTeams();
  Navigation.exportToURL();
  Navigation.renderPage();
});

// Enable navigation in history

$(window).bind("popstate", Navigation.handleHistoryNavigation);
