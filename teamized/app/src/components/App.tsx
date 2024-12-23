/**
 *  This is the root app component.
 */

import React, { useEffect } from 'react';

import * as SettingsService from '../service/settings.service';
import * as TeamsService from '../service/teams.service';
import * as WorkingtimeService from '../service/workingtime.service';
import { useAppdata, useAppdataRefresh } from '../utils/appdataProvider';
import {
    useNavigationState,
    useNavigationStateDispatch,
} from '../utils/navigation/navigationProvider';
import AppMenubar from './menubar';
import { PageLoader } from './pageloader';
import AppSidebar from './sidebar';

export default function App() {
    const { selectedTeamId } = useNavigationState();
    const updateNavigationState = useNavigationStateDispatch();

    const appdata = useAppdata();
    const refreshData = useAppdataRefresh();

    // On initial render
    useEffect(() => {
        console.debug('[Teamized] Initial render of App component.');

        // Load data
        Promise.all([
            SettingsService.getSettings().then(refreshData),
            SettingsService.getProfile().then(refreshData),
            TeamsService.getTeams().then(refreshData),
        ]).then(() => {
            window.appdata.initialLoadComplete = true;
            window.appdata.loadInProgress = false;
            refreshData();
        });
        WorkingtimeService.getTrackingSession().then(refreshData);

        // Check URL for invite
        TeamsService.checkURLInvite()
            .then((result) => {
                if (result && result.isConfirmed) {
                    updateNavigationState({
                        update: { pageName: 'team', teamId: result.value!.id },
                        remove: ['invite'],
                    });
                    refreshData();
                }
            })
            .catch(() => {
                updateNavigationState({ remove: ['invite'] });
            });
    }, [updateNavigationState, refreshData]);

    // On every render
    useEffect(() => {
        // Ensure valid team id
        if (
            !(selectedTeamId in appdata.teamCache) &&
            appdata.initialLoadComplete &&
            appdata.defaultTeamId
        ) {
            updateNavigationState({
                update: { selectedTeamId: appdata.defaultTeamId },
            });
        }
    });

    return (
        <>
            <AppMenubar
                teams={TeamsService.getTeamsList()}
                user={appdata.user}
            />

            <div id="app-root" className="d-flex">
                <div id="app-sidebar" data-bs-theme="dark">
                    <AppSidebar user={appdata.user} />
                </div>
                <div id="app-maincontent" className="flex-grow-1 overflow-auto">
                    <PageLoader />
                </div>
            </div>
        </>
    );
}
