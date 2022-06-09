import * as Alerts from "./utils/alerts.js";
import * as API from "./utils/api.js";
import * as Cache from "./utils/cache.js";
import * as Navigation from "./utils/navigation.js";
import * as Teams from "./utils/teams.js";
import * as Utils from "./utils/utils.js";
import * as WorkingTime from "./utils/workingtime.js";
import * as Calendars from "./utils/calendars.js";

// Make namespaces available in the console (for debugging)

window._OrgaTask = {
  Alerts,
  API,
  Cache,
  Calendars,
  Navigation,
  Teams,
  Utils,
  WorkingTime,
};

// Initialize

let loadinprogress = true;

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

function startLoading() {
  loadinprogress = true;
  $("#refreshbutton>a>i").addClass("fa-spin");
}

function endLoading() {
  loadinprogress = false;
  $("#refreshbutton>a>i").removeClass("fa-spin");
}

async function initialize() {
  startLoading();

  Navigation.hideSidebarOnMobile();
  Navigation.importFromURL();
  Navigation.renderMenubar();
  window.orgatask.user = await Teams.getProfile();
  Navigation.renderSidebar();
  await Teams.loadTeams(true); // Load teams from API and build cache
  Navigation.exportToURL();
  Navigation.renderPage();
  
  Teams.checkURLInvite();
  WorkingTime.getTrackingSession();

  endLoading();
}

async function reinitialize() {
  startLoading();

  window.orgatask = {
    ...window.orgatask,
    defaultTeamId: null,
    selectedTeamId: null,
    teamcache: {},
  };
  Navigation.renderMenubar();
  await Teams.loadTeams(true); // Load teams from API and build cache
  Navigation.exportToURL();
  Navigation.renderPage();
  WorkingTime.getTrackingSession();

  endLoading();
}

// Reload

async function refresh() {
  if (!loadinprogress) {
    await reinitialize();
  }
}

function f5pressed(e) {
  if (e.keyCode == 116) {
    if (e.shiftKey) {
      e.preventDefault();
      window.location.reload(true);
    } else if (!e.ctrlKey) {
      e.preventDefault();
      refresh();
    }
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
$(document).keydown(f5pressed);
