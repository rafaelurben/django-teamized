// Caching

import * as Teams from "./teams.js";

export function getTeamsList() {
    let teams = [];
    for (let teamdata of Object.values(window.orgatask.teamcache)) {
        teams.push(teamdata.team);
    }
    return teams;
}

export function addTeam(team) {
    window.orgatask.teamcache[team.id] = {
        "team": team,
        "members": {},
        "invites": {},
    };
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
        await Teams.loadTeams();
    } else if (window.orgatask.defaultTeamId === teamId) {
        // When the default team is deleted, we need to switch to another team
        window.orgatask.defaultTeamId = teamIds[0];
    }
}

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
            window.orgatask.teamcache[team.id].team = team;
        } else {
            addTeam(team)
        }
    }

    // Remove teams that are no longer in the list
    for (let teamId of oldids) {
        delete window.orgatask.teamcache[teamId];
    }
}

export function updateMembersCache(teamId, members) {
    window.orgatask.teamcache[teamId].members = {};
    for (let member of members) {
        window.orgatask.teamcache[teamId].members[member.id] = member;
    }
}

export function updateInvitesCache(teamId, invites) {
    window.orgatask.teamcache[teamId].invites = {};
    for (let invite of invites) {
        window.orgatask.teamcache[teamId].invites[invite.id] = invite;
    }
}
