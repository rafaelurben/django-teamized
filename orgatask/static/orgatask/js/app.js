import * as Organizations from './modules/organizations.js';
import * as PageLoader from './modules/page-loader.js';

window.orgatask = {};

$("document").ready(async function() {
    PageLoader.importFromURL();
    await Organizations.loadOrgs();
    PageLoader.exportToURL();
    PageLoader.loadPage();
})
