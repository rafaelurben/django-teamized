// Caching

import * as API from "./api.js";
import * as Navigation from "./navigation.js";
import * as Teams from "./teams.js";


// Lookups

export function getTeamsList() {
    let teams = [];
    for (let teamdata of Object.values(window.orgatask.teamcache)) {
        teams.push(teamdata.team);
    }
    return teams;
}

export function getTeamData(teamId) {
    return window.orgatask.teamcache[teamId];
}

export function getCurrentTeamData() {
    return getTeamData(window.orgatask.selectedTeamId);
}

export function getMeInTeam(teamId) {
    return getTeamData(teamId).team.member;
}

export function getMeInCurrentTeam() {
    return getMeInTeam(window.orgatask.selectedTeamId);
}

export function getMemberInTeam(teamId, memberId) {
    return getTeamData(teamId).members[memberId];
}

// Add and remove teams from cache

function updateTeam(team) {
    if (team.hasOwnProperty("members")) {
        window.orgatask.teamcache[team.id].members = {}
        replaceMembersCache(team.id, team.members);
        delete team.members;
    }
    if (team.hasOwnProperty("invites")) {
        window.orgatask.teamcache[team.id].invites = {}
        replaceInvitesCache(team.id, team.invites);
        delete team.invites;
    }
    window.orgatask.teamcache[team.id].team = team;
}

export function addTeam(team) {
    window.orgatask.teamcache[team.id] = {
        "team": {},
        "members": {},
        "invites": {},
        "calendars": {},
        "_state": {calendars: {_initial: true, _refreshing: false}},
    };
    updateTeam(team);
}

export async function deleteTeam(teamId) {
    // Delete the team from the teamcache
    delete window.orgatask.teamcache[teamId];
    // Update the defaultTeamId
    let teamIds = Object.keys(window.orgatask.teamcache);
    if (teamIds.length === 0) {
        // When no team is left, the backend automatically creates a new one
        // We need to refetch all teams in order to get the new one
        // This also sets the defaultTeamId
        await Teams.loadTeams(true);
    } else if (window.orgatask.defaultTeamId === teamId) {
        // When the default team is deleted, we need to switch to another team
        window.orgatask.defaultTeamId = teamIds[0];
    }
}

// Bulk update teams cache

export function updateTeamsCache(teams, defaultTeamId) {
    window.orgatask.defaultTeamId = defaultTeamId;

    let oldids = Object.keys(window.orgatask.teamcache);

    for (let team of teams) {
        // Remove from oldidlist if it is still there
        if (oldids.includes(team.id)) {
            oldids.splice(oldids.indexOf(team.id), 1);
        }

        // Update in cache if already there, else add
        if (team.id in window.orgatask.teamcache) {
            updateTeam(team);
        } else {
            addTeam(team)
        }
    }

    // Remove teams that are no longer in the list
    for (let teamId of oldids) {
        delete window.orgatask.teamcache[teamId];
    }
}

// Team cache categories (members, invites, ...)

export function replaceTeamCacheCategory(teamId, category, objects) {
    let teamdata = getTeamData(teamId);
    teamdata[category] = {};
    for (let obj of objects) {
        teamdata[category][obj.id] = obj;
    }
}

export async function refreshTeamCacheCategory(teamId, category) {
    return new Promise(async (resolve, reject) => {
        let teamdata = getTeamData(teamId);
        if (teamdata._state[category]._refreshing) {
            reject("Already refreshing");
        } else {
            teamdata._state[category]._refreshing = true;
            await API.GET(`teams/${teamId}/${category}`).then(
                (data) => {
                    let objects = data[category];
                    replaceTeamCacheCategory(teamId, category, objects);
                    delete teamdata[category]["_refreshing"];

                    teamdata._state[category]._initial = false;
                    teamdata._state[category]._refreshing = false;
                    Navigation.renderPage();

                    resolve(objects);
                }
            );
        }
    });
}

export function replaceMembersCache(teamId, members) {
    replaceTeamCacheCategory(teamId, "members", members);
}

export function replaceInvitesCache(teamId, invites) {
    replaceTeamCacheCategory(teamId, "invites", invites);
}

export function replaceCalendarsCache(teamId, calendars) {
    replaceTeamCacheCategory(teamId, "calendars", calendars);
}
