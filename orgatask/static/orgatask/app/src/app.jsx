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
  Navigation.loadPage();
})

// Allow navigation in history

function onHistoryNavigated() {
  console.log("Navigated in history! Switching page...");
  Navigation.importFromURL();
  Navigation.renderMenubar(); // only render the menubar because refetching the teams takes too much time
  Navigation.exportToURL();
  Navigation.loadPage();
}

$(window).bind("popstate", onHistoryNavigated);
