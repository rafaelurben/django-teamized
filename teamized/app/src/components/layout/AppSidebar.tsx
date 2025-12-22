import {
    Bug,
    CalendarDays,
    ClipboardClock,
    ClipboardList,
    Contact,
    Grid2x2,
    House,
    Info,
    ListTodo,
    RefreshCw,
    Users,
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
import AppSidebarMainNavigation from '@/teamized/components/layout/AppSidebarMainNavigation';
import AppSidebarSecondaryNavigation from '@/teamized/components/layout/AppSidebarSecondaryNavigation';
import { AppSidebarTeamSwitcher } from '@/teamized/components/layout/AppSidebarTeamSwitcher';
import { AppSidebarUserMenu } from '@/teamized/components/layout/AppSidebarUserMenu';
import { User } from '@/teamized/interfaces/user';
import * as TeamsService from '@/teamized/service/teams.service';
import { useAppdata } from '@/teamized/utils/appdataProvider';
import * as GeneralUtils from '@/teamized/utils/general';
import {
    useCurrentTeamData,
    useNavigationState,
} from '@/teamized/utils/navigation/navigationProvider';

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
                                    icon: House,
                                },
                                {
                                    label: 'Teams',
                                    page: 'teamlist',
                                    icon: Grid2x2,
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
                                    icon: Users,
                                },
                                {
                                    label: 'Arbeitszeit',
                                    page: 'workingtime',
                                    icon: ClipboardClock,
                                },
                                {
                                    label: 'Kalender',
                                    page: 'calendars',
                                    icon: CalendarDays,
                                },
                                {
                                    label: 'To-do-Listen',
                                    page: 'todo',
                                    icon: ListTodo,
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
                                    icon: Contact,
                                },
                                {
                                    label: 'Anwesenheit',
                                    page: 'club_attendance',
                                    icon: ClipboardList,
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
                            icon: Info,
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
                            icon: RefreshCw,
                            onClick: () => {
                                softRefresh();
                            },
                        },
                        {
                            label: 'Debug-Menü',
                            icon: Bug,
                            className: 'debug-only',
                            dropdownItems: [
                                {
                                    label: 'Debug-Seite öffnen',
                                    icon: Bug,
                                    onClick: () => {
                                        window.open(
                                            window.teamized_globals.debug_url,
                                            '_blank'
                                        );
                                    },
                                },
                                {
                                    label: 'Debug-Modus verlassen (Shift+F6)',
                                    icon: Bug,
                                    onClick: () => GeneralUtils.toggleDebug(),
                                },
                                {
                                    label: 'Toggle Debug-IDs',
                                    icon: Bug,
                                    onClick: () =>
                                        GeneralUtils.toggleDebugIds(),
                                },
                                {
                                    label: 'location.reload()',
                                    icon: RefreshCw,
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
