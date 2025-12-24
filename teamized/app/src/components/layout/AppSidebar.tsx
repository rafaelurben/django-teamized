import {
    BugIcon,
    CalendarDaysIcon,
    ClipboardClockIcon,
    ClipboardListIcon,
    ContactIcon,
    Grid2x2Icon,
    HouseIcon,
    InfoIcon,
    ListTodoIcon,
    RefreshCwIcon,
    UsersIcon,
} from 'lucide-react';
import React from 'react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from '@/shadcn/components/ui/sidebar';
import { softRefresh } from '@/teamized/app';
import { User } from '@/teamized/interfaces/user';
import * as TeamsService from '@/teamized/service/teams.service';
import { useAppdata } from '@/teamized/utils/appdataProvider';
import * as GeneralUtils from '@/teamized/utils/general';
import {
    useCurrentTeamData,
    useNavigationState,
} from '@/teamized/utils/navigation/navigationProvider';

import AppSidebarMainNavigation from './AppSidebarMainNavigation';
import AppSidebarSecondaryNavigation from './AppSidebarSecondaryNavigation';
import { AppSidebarTeamSwitcher } from './AppSidebarTeamSwitcher';
import { AppSidebarUserMenu } from './AppSidebarUserMenu';

export default function AppSidebar() {
    const appdata = useAppdata();
    const teams = TeamsService.getTeamsList();
    const user: User = appdata.user;

    const { selectedTeamId } = useNavigationState();
    const teamData = useCurrentTeamData();

    return (
        <Sidebar>
            <SidebarHeader>
                <AppSidebarTeamSwitcher
                    teams={teams}
                    selectedTeam={teamData?.team}
                />
            </SidebarHeader>
            <SidebarContent>
                <AppSidebarMainNavigation
                    groups={[
                        {
                            id: 'unsorted',
                            items: [
                                {
                                    label: 'Startseite',
                                    page: 'home',
                                    icon: HouseIcon,
                                },
                                {
                                    label: 'Teams',
                                    page: 'teamlist',
                                    icon: Grid2x2Icon,
                                },
                            ],
                        },
                        {
                            id: 'team',
                            hidden: !selectedTeamId,
                            label: 'Team',
                            items: [
                                {
                                    label: 'Team',
                                    page: 'team',
                                    icon: UsersIcon,
                                },
                                {
                                    label: 'Arbeitszeit',
                                    page: 'workingtime',
                                    icon: ClipboardClockIcon,
                                },
                                {
                                    label: 'Kalender',
                                    icon: CalendarDaysIcon,
                                    isSubmenu: true,
                                    subitems: [
                                        {
                                            label: 'Ereignisse',
                                            page: 'calendars_events',
                                        },
                                        {
                                            label: 'Kalender verwalten',
                                            page: 'calendars_manage',
                                        },
                                    ],
                                },
                                {
                                    label: 'To-do-Listen',
                                    page: 'todo',
                                    icon: ListTodoIcon,
                                },
                            ],
                        },
                        {
                            id: 'club',
                            hidden: teamData?.team.club == null,
                            label: 'Verein',
                            items: [
                                {
                                    label: 'Verein',
                                    page: 'club',
                                    icon: ContactIcon,
                                },
                                {
                                    label: 'Anwesenheit',
                                    page: 'club_attendance',
                                    icon: ClipboardListIcon,
                                    isBeta: true,
                                },
                            ],
                        },
                    ]}
                />
                <AppSidebarSecondaryNavigation
                    items={[
                        {
                            label: 'Teamized v' + __TEAMIZED_VERSION__,
                            icon: InfoIcon,
                            onClick: () => {
                                window.open(
                                    window.teamized_globals.home_url,
                                    '_blank',
                                    'noopener'
                                );
                            },
                        },
                        {
                            label: 'Neu laden (F5)',
                            icon: RefreshCwIcon,
                            onClick: () => {
                                softRefresh();
                            },
                        },
                        {
                            label: 'Debug-Menü',
                            icon: BugIcon,
                            className: 'debug-only',
                            dropdownItems: [
                                {
                                    label: 'Debug-Seite öffnen',
                                    icon: BugIcon,
                                    onClick: () => {
                                        window.open(
                                            window.teamized_globals.debug_url,
                                            '_blank'
                                        );
                                    },
                                },
                                {
                                    label: 'Debug-Modus verlassen (Shift+F6)',
                                    icon: BugIcon,
                                    onClick: () => GeneralUtils.toggleDebug(),
                                },
                                {
                                    label: 'Toggle Debug-IDs',
                                    icon: BugIcon,
                                    onClick: () =>
                                        GeneralUtils.toggleDebugIds(),
                                },
                                {
                                    label: 'location.reload()',
                                    icon: RefreshCwIcon,
                                    onClick: () => location.reload(),
                                },
                            ],
                        },
                    ]}
                />
            </SidebarContent>
            <SidebarFooter>
                <AppSidebarUserMenu user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
