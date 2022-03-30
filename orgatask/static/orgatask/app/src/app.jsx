import * as Teams from './orgatask_modules/teams.js';
import * as PageLoader from './orgatask_modules/page-loader.js';

window.orgatask = {
  teams: [],
  selectedTeamId: null,
  defaultTeamId: null
};

$("document").ready(async function () {
  $("a[data-page]").click((e) => {
    console.debug("Clicked page: " + e.currentTarget.dataset.page);
    PageLoader.selectPage(e.currentTarget.dataset.page);
  });


  PageLoader.importFromURL();
  await Teams.loadTeams();
  PageLoader.exportToURL();
  PageLoader.loadPage();
})

$(window).bind("popstate", async function(e) {
  console.log("Navigated in history! Switching page...");
  PageLoader.importFromURL();
  Teams.renderMenubar();
  PageLoader.loadPage();
});
