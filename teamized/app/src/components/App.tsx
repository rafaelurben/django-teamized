/**
 *  This is the root app component.
 */

import React, { useEffect } from 'react';

import * as TeamsService from '../service/teams.service';
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

    useEffect(() => {
        // Check URL invite on page load
        TeamsService.checkURLInvite()
            .then((result) => {
                if (result && result.isConfirmed) {
                    updateNavigationState({
                        update: { pageName: 'team', teamId: result.value!.id },
                        remove: ['invite'],
                    });
                }
            })
            .catch(() => {
                updateNavigationState({ remove: ['invite'] });
            });
    }, [updateNavigationState]);

    useEffect(() => {
        ensureValidTeamId();
    });

    const ensureValidTeamId = () => {
        if (
            !(selectedTeamId in window.appdata.teamCache) &&
            window.appdata.initialLoadComplete &&
            window.appdata.defaultTeamId
        ) {
            updateNavigationState({
                update: { selectedTeamId: window.appdata.defaultTeamId },
            });
        }
    };

    return (
        <>
            <AppMenubar
                teams={TeamsService.getTeamsList()}
                user={window.appdata.user}
            />

            <div id="app-root" className="d-flex">
                <div id="app-sidebar" data-bs-theme="dark">
                    <AppSidebar user={window.appdata.user} />
                </div>
                <div id="app-maincontent" className="flex-grow-1 overflow-auto">
                    <PageLoader />
                </div>
            </div>
        </>
    );
}
