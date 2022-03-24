import * as Teams from './modules/teams.js';
import * as PageLoader from './modules/page-loader.js';

window.orgatask = {};

$("document").ready(async function() {
    PageLoader.importFromURL();
    await Teams.loadTeams();
    PageLoader.exportToURL();
    PageLoader.loadPage();
})
