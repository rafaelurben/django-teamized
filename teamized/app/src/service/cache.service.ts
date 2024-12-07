/**
 * Utils for the local team cache
 */

import * as TeamsAPI from '../api/teams';
import { CacheCategory } from '../interfaces/cache/cacheCategory';
import { CacheCategoryType } from '../interfaces/cache/cacheCategoryType';
import { TeamCache } from '../interfaces/cache/teamCache';
import { ID } from '../interfaces/common';
import { Team } from '../interfaces/teams/team';
import * as NavigationService from './navigation.service';
import * as TeamsService from './teams.service';

// Lookups

export function getTeamsList() {
    const teams: Team[] = [];
    for (const teamData of Object.values(window.appdata.teamCache)) {
        teams.push(teamData.team);
    }
    return teams;
}

export function getTeamData(teamId: ID) {
    return window.appdata.teamCache[teamId] || null;
}

export function getCurrentTeamData() {
    return getTeamData(window.appdata.selectedTeamId!);
}

// Add and remove teams from cache

function updateTeam(
    team: Team & {
        [key in CacheCategory]?: CacheCategoryType[];
    }
) {
    for (const category of Object.values(CacheCategory)) {
        if (Object.hasOwn(team, category)) {
            window.appdata.teamCache[team.id][category] = {};
            replaceTeamCacheCategory(team.id, category, team[category]!);
            delete team[category];
            // Delete the category from the team object itself to avoid data redundancy
        }
    }
    window.appdata.teamCache[team.id].team = team;
}

export function addTeam(team: Team) {
    const newTeamCache = { team: team, _state: {} };
    for (const category of Object.values(CacheCategory)) {
        newTeamCache[category] = {};
        newTeamCache._state[category] = {
            _initial: true,
            _refreshing: false,
        };
    }
    window.appdata.teamCache[team.id] = <TeamCache>newTeamCache;
    updateTeam(team);
}

export async function deleteTeam(teamId: ID) {
    // Delete the team from the team cache
    delete window.appdata.teamCache[teamId];
    // Update the defaultTeamId
    const teamIds = Object.keys(window.appdata.teamCache);
    if (teamIds.length === 0) {
        // When no team is left, the backend automatically creates a new one
        // We need to re-fetch all teams in order to get the new one
        // This also sets the defaultTeamId
        await TeamsService.getTeams();
    } else if (window.appdata.defaultTeamId === teamId) {
        // When the default team is deleted, we need to switch to another team
        window.appdata.defaultTeamId = teamIds[0];
    }
}

// Bulk update teams cache

export function updateTeamsCache(teams: Team[], defaultTeamId: ID) {
    window.appdata.defaultTeamId = defaultTeamId;

    const oldIds = Object.keys(window.appdata.teamCache);

    for (const team of teams) {
        // Remove team from oldIds if it was there
        if (oldIds.includes(team.id)) {
            oldIds.splice(oldIds.indexOf(team.id), 1);
        }

        // Update in cache if team is already there, else add
        if (team.id in window.appdata.teamCache) {
            updateTeam(team);
        } else {
            addTeam(team);
        }
    }

    // Remove teams that are no longer in the list
    for (const teamId of oldIds) {
        delete window.appdata.teamCache[teamId];
    }
}

// Team cache categories (members, invites, ...)

export function replaceTeamCacheCategory<T extends CacheCategoryType>(
    teamId: ID,
    category: CacheCategory,
    objects: T[]
) {
    const teamData = getTeamData(teamId);
    if (teamData === null) {
        console.warn(
            '[Cache] Team ' +
                teamId +
                ' not found in cache. This usually happens when the page is soft reloaded twice in short succession and should not be a problem.'
        );
    } else {
        teamData[category] = {};
        for (const obj of objects) {
            teamData[category][obj.id] = obj;
        }
    }
}

export async function refreshTeamCacheCategory<T extends CacheCategoryType>(
    teamId: ID,
    category: CacheCategory
) {
    return new Promise<T[]>((resolve, reject) => {
        const teamData = getTeamData(teamId);
        if (teamData._state[category]._refreshing === true) {
            // If the category is already being refreshed, we don't need to do anything
            // This will neither resolve nor reject the promise
            console.info(
                '[Cache] Team category ' +
                    category +
                    ' is already being refreshed for team ' +
                    teamId +
                    '!'
            );
        } else {
            teamData._state[category]._refreshing = true;
            TeamsAPI.getItemsOfCategory<{ [key: string]: T[] }>(
                teamId,
                category
            )
                .then((data) => {
                    const objects: T[] = data[category.split('_').at(-1)!];
                    replaceTeamCacheCategory<T>(teamId, category, objects);

                    teamData._state[category]._initial = false;
                    teamData._state[category]._refreshing = false;
                    NavigationService.render();

                    resolve(objects);
                })
                .catch((error) => {
                    teamData._state[category]._refreshing = false;
                    reject(error);
                });
        }
    });
}
