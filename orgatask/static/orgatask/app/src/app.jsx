import * as Teams from './utils/teams.js';
import * as Navigation from './utils/navigation.js';

// Initialize empty data object
window.orgatask = {
  teams: [],
  selectedTeamId: null,
  defaultTeamId: null
};

// Perform tasks after page load
$("document").ready(async function () {

  // Add event listeners to nav buttons
  $("a[data-page]").click((e) => {
    console.debug("Clicked page: " + e.currentTarget.dataset.page);
    Navigation.selectPage(e.currentTarget.dataset.page);
  });


  Navigation.importFromURL();
  await Teams.loadTeams();
  Navigation.exportToURL();
  Navigation.loadPage();
})

$(window).bind("popstate", async function(e) {
  console.log("Navigated in history! Switching page...");
  Navigation.importFromURL();
  Teams.renderMenubar(); // only render the menubar because refetching the teams takes too much time
  Navigation.exportToURL();
  Navigation.loadPage();
});
