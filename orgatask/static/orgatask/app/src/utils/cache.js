// Caching

import * as Teams from "./teams.js";

export function addTeam(team, addtolist=true) {
    // Add to teamcache
    window.orgatask.teamcache[team.id] = {
        "team": team,
        "members": {},
        "invites": {},
    };
    // Add to teamlist
    if (addtolist) {window.orgatask.teams.push(team)};
}

export async function deleteTeam(teamId) {
    // Delete the team from the teamcache
    delete window.orgatask.teamcache[teamId];
    // Delete the team from the teamlist
    for (let i = 0; i < window.orgatask.teams.length; i++) {
        if (window.orgatask.teams[i].id === teamId) {
            window.orgatask.teams.splice(i, 1);
        }
    }
    // Update the defaultTeamId
    if (window.orgatask.teams.length === 0) {
        // When no team is left, the backend automatically creates a new one
        // We need to refetch all teams in order to get the new one
        // This also sets the defaultTeamId
        await Teams.loadTeams();
    } else if (window.orgatask.defaultTeamId === teamId) {
        // When the default team is deleted, we need to switch to another team
        window.orgatask.defaultTeamId = window.orgatask.teams[0].id;
    }
}

export function updateTeamsCache(teams, defaultTeamId) {
    window.orgatask.teams = teams;
    window.orgatask.defaultTeamId = defaultTeamId;

    let oldids = Object.keys(window.orgatask.teamcache);

    for (let team of teams) {
        // Remove from oldidlist if it is still there
        if (oldids.includes(team.id)) {
            oldids.splice(oldids.indexOf(team.id), 1);
        }

        // Add to cache if it doesn't exist; else replace
        if (!(team.id in window.orgatask.teamcache)) {
            addTeam(team, false)
        } else {
            window.orgatask.teamcache[team.id].team = team;
        }
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
