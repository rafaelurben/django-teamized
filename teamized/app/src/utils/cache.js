/**
 * Utils for the local team cache
 */

import * as TeamsAPI from '../api/teams';
import * as Navigation from './navigation.tsx';
import * as Teams from './teams';

// Lookups

export function getTeamsList() {
    let teams = [];
    for (let teamdata of Object.values(window.appdata.teamcache)) {
        teams.push(teamdata.team);
    }
    return teams;
}

export function getTeamData(teamId) {
    return window.appdata.teamcache[teamId] || null;
}

export function getCurrentTeamData() {
    return getTeamData(window.appdata.selectedTeamId);
}

export function getMeInTeam(teamId) {
    return getTeamData(teamId).team.member;
}

export function getMeInCurrentTeam() {
    return getMeInTeam(window.appdata.selectedTeamId);
}

export function getMemberInTeam(teamId, memberId) {
    return getTeamData(teamId).members[memberId];
}

// Add and remove teams from cache

function updateTeam(team) {
    for (let category of ['members', 'invites', 'calendars', 'todolists']) {
        if (team.hasOwnProperty(category)) {
            window.appdata.teamcache[team.id][category] = {};
            replaceTeamCacheCategory(team.id, category, team[category]);
            delete team[category];
            // Delete the category from the team object itself to avoid data redundancy
        }
    }
    window.appdata.teamcache[team.id].team = team;
}

export function addTeam(team) {
    window.appdata.teamcache[team.id] = {
        team: {},
        calendars: {},
        invites: {},
        members: {},
        todolists: {},
        me_worksessions: {},
        club_members: {},
        club_groups: {},
        _state: {
            calendars: { _initial: true, _refreshing: false },
            invites: { _initial: true, _refreshing: false },
            members: { _initial: true, _refreshing: false },
            todolists: { _initial: true, _refreshing: false },
            me_worksessions: { _initial: true, _refreshing: false },
            club_members: { _initial: true, _refreshing: false },
            club_groups: { _initial: true, _refreshing: false },
        },
    };
    updateTeam(team);
}

export async function deleteTeam(teamId) {
    // Delete the team from the teamcache
    delete window.appdata.teamcache[teamId];
    // Update the defaultTeamId
    let teamIds = Object.keys(window.appdata.teamcache);
    if (teamIds.length === 0) {
        // When no team is left, the backend automatically creates a new one
        // We need to refetch all teams in order to get the new one
        // This also sets the defaultTeamId
        await Teams.getTeams();
    } else if (window.appdata.defaultTeamId === teamId) {
        // When the default team is deleted, we need to switch to another team
        window.appdata.defaultTeamId = teamIds[0];
    }
}

// Bulk update teams cache

export function updateTeamsCache(teams, defaultTeamId) {
    window.appdata.defaultTeamId = defaultTeamId;

    let oldids = Object.keys(window.appdata.teamcache);

    for (let team of teams) {
        // Remove from oldidlist if it is still there
        if (oldids.includes(team.id)) {
            oldids.splice(oldids.indexOf(team.id), 1);
        }

        // Update in cache if already there, else add
        if (team.id in window.appdata.teamcache) {
            updateTeam(team);
        } else {
            addTeam(team);
        }
    }

    // Remove teams that are no longer in the list
    for (let teamId of oldids) {
        delete window.appdata.teamcache[teamId];
    }
}

// Team cache categories (members, invites, ...)

export function replaceTeamCacheCategory(teamId, category, objects) {
    let teamdata = getTeamData(teamId);
    if (teamdata === null) {
        console.warn(
            '[Cache] Team ' +
                teamId +
                ' not found in cache. This usually happens when the page is soft reloaded twice in short succession and should not be a problem.'
        );
    } else {
        teamdata[category] = {};
        for (let obj of objects) {
            teamdata[category][obj.id] = obj;
        }
    }
}

export async function refreshTeamCacheCategory(teamId, category) {
    return new Promise((resolve, reject) => {
        let teamdata = getTeamData(teamId);
        if (teamdata._state[category]._refreshing === true) {
            // If the category is already being refreshed, we don't need to do anything
            // This will not resolve nor reject the promise
            console.info(
                '[Cache] Team category ' +
                    category +
                    ' is already being refreshed for team ' +
                    teamId +
                    '!'
            );
        } else {
            teamdata._state[category]._refreshing = true;
            TeamsAPI.getItemsOfCategory(teamId, category)
                .then((data) => {
                    let objects =
                        data[
                            category.split('_')[category.split('_').length - 1]
                        ];
                    replaceTeamCacheCategory(teamId, category, objects);

                    teamdata._state[category]._initial = false;
                    teamdata._state[category]._refreshing = false;
                    Navigation.renderPage();

                    resolve(objects);
                })
                .catch((error) => {
                    teamdata._state[category]._refreshing = false;
                    reject(error);
                });
        }
    });
}
