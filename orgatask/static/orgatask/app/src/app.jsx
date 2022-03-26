import * as Teams from './orgatask_modules/teams.js';
import * as PageLoader from './orgatask_modules/page-loader.js';

window.orgatask = {
  teams: [],
  selectedTeamId: null,
  default_team_id: null
};

$("document").ready(async function () {
  PageLoader.importFromURL();
  await Teams.loadTeams();
  PageLoader.exportToURL();
  PageLoader.loadPage();
})
