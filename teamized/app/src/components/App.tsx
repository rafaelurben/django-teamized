/**
 *  This is the root app component.
 */

import React from 'react';

import * as NavigationService from '../service/navigation.service';
import * as TeamsService from '../service/teams.service';
import AppMenubar from './menubar';
import { PageLoader } from './pageloader';
import AppSidebar from './sidebar';

export default function App() {
    return (
        <>
            <AppMenubar
                teams={TeamsService.getTeamsList()}
                user={window.appdata.user}
                selectedTeamId={window.appdata.selectedTeamId}
                onTeamSelect={TeamsService.switchTeam}
                onPageSelect={NavigationService.selectPage}
            />

            <div id="app-root" className="d-flex">
                <div id="app-sidebar" data-bs-theme="dark">
                    <AppSidebar
                        selectedPage={window.appdata.currentPage}
                        user={window.appdata.user}
                        isAdmin={TeamsService.isCurrentTeamAdmin()}
                        isClubEnabled={TeamsService.hasCurrentTeamLinkedClub()}
                        onPageSelect={NavigationService.selectPage}
                    />
                </div>
                <div id="app-maincontent" className="flex-grow-1 overflow-auto">
                    <PageLoader page={window.appdata.currentPage} />
                </div>
            </div>
        </>
    );
}
