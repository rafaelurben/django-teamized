import * as Alerts from "./utils/alerts.js";
import * as API from "./utils/api.js";
import * as Cache from "./utils/cache.js";
import * as Navigation from "./utils/navigation.js";
import * as Teams from "./utils/teams.js";
import * as Utils from "./utils/utils.js";

// Initialize empty data object

window.orgatask = {
  currentPage: "teamlist",
  defaultTeamId: null,
  selectedTeamId: null,
  teamcache: {},
};

// Make namespaces available in the console (for debugging)

window._OrgaTask = {
  Alerts,
  API,
  Cache,
  Navigation,
  Teams,
  Utils,
};

// Perform tasks after page load

$("document").ready(async function () {
  Navigation.renderMenubar();
  Navigation.importFromURL();
  await Teams.loadTeams();
  Navigation.exportToURL();
  Navigation.renderPage();

  // Build caches
  let promises = [];
  for (let team of Teams.getTeamsList()) {
    promises.push(Teams.getMembers(team.id));
    if (team.member.role === "owner") {
      promises.push(Teams.getInvites(team.id));
    }
  }
  await Promise.all(promises);
  Navigation.renderPage();
});

// Add event listener for page navigation

$(window).bind("popstate", Navigation.handleHistoryNavigation);
