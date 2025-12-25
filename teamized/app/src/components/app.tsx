/**
 *  This is the root app component.
 */

import React, { useEffect } from 'react';

import { SidebarProvider } from '@/shadcn/components/ui/sidebar';
import { Toaster } from '@/shadcn/components/ui/sonner';
import * as GeneralAPI from '@/teamized/api/general';
import AppSidebar from '@/teamized/components/layout/AppSidebar';
import { PageLoader } from '@/teamized/components/pages/pageLoader';
import * as SettingsService from '@/teamized/service/settings.service';
import * as TeamsService from '@/teamized/service/teams.service';
import * as WorkingtimeService from '@/teamized/service/workingtime.service';
import { toast } from '@/teamized/utils/alerts';
import {
    useAppdata,
    useAppdataRefresh,
} from '@/teamized/utils/appdataProvider';
import {
    useNavigationState,
    useNavigationStateDispatch,
} from '@/teamized/utils/navigation/navigationProvider';

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

        // Fetch and display Django messages
        GeneralAPI.getMessages().then((messages) => {
            messages.forEach((msg) => {
                switch (msg.type) {
                    case 'success':
                        toast.success(msg.text);
                        break;
                    case 'error':
                        toast.error(msg.text);
                        break;
                    case 'warning':
                        toast.warning(msg.text);
                        break;
                    case 'info':
                        toast.info(msg.text);
                        break;
                    default:
                        toast(msg.text);
                }
            });
        });

        // Check URL for invite
        TeamsService.checkURLInvite()
            .then((result) => {
                if (result?.isConfirmed) {
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
        <SidebarProvider id="app-root">
            <AppSidebar />
            <main
                id="app-maincontent"
                className="tw:flex-1 tw:overflow-y-auto tw:overflow-x-hidden"
            >
                <PageLoader />
            </main>
            <Toaster
                theme={
                    appdata.settings.darkmode === true
                        ? 'dark'
                        : appdata.settings.darkmode === false
                          ? 'light'
                          : 'system'
                }
                position="top-center"
            />
        </SidebarProvider>
    );
}
