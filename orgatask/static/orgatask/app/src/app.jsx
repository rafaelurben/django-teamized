import * as Teams from './utils/teams.js';
import * as Navigation from './utils/navigation.js';

// Initialize empty data object
window.orgatask = {
  teams: [],
  selectedTeamId: null,
  defaultTeamId: null
};

// Make namespaces available in the console (for debugging)
window._OrgaTask_Navigation = Navigation;
window._OrgaTask_Teams = Teams;

// Perform tasks after page load

$("document").ready(async function () {
  Navigation.renderMenubar();
  Navigation.importFromURL();
  await Teams.loadTeams();
  Navigation.exportToURL();
  Navigation.renderPage();
})

// Allow navigation in history

$(window).bind("popstate", Navigation.handleHistoryNavigation);
