'use client';

import {
    CheckIcon,
    ChevronsUpDownIcon,
    SettingsIcon,
    UsersIcon,
} from 'lucide-react';
import * as React from 'react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shadcn/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/shadcn/components/ui/sidebar';
import { Team } from '@/teamized/interfaces/teams/team';
import {
    usePageNavigator,
    useTeamSwitcher,
} from '@/teamized/utils/navigation/navigationProvider';

interface Props {
    teams: Team[];
    selectedTeam: Team | null;
}

export function AppSidebarTeamSwitcher({
    teams,
    selectedTeam,
}: Readonly<Props>) {
    const { isMobile, setOpenMobile } = useSidebar();
    const selectTeam = useTeamSwitcher();
    const selectPage = usePageNavigator();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                {selectedTeam ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="tw:data-[state=open]:bg-sidebar-accent tw:data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <div className="tw:bg-sidebar-primary tw:text-sidebar-primary-foreground tw:flex tw:aspect-square tw:size-8 tw:items-center tw:justify-center tw:rounded-lg">
                                    <UsersIcon className="tw:size-4" />
                                </div>
                                <div className="tw:grid tw:flex-1 tw:text-left tw:text-sm tw:leading-tight">
                                    <span className="tw:truncate tw:font-medium">
                                        {selectedTeam.name}
                                    </span>
                                    <span className="tw:truncate tw:text-xs">
                                        {selectedTeam.member?.role_text}
                                    </span>
                                </div>
                                <ChevronsUpDownIcon className="tw:ml-auto" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="tw:w-(--radix-dropdown-menu-trigger-width) tw:min-w-56 tw:rounded-lg"
                            align="start"
                            side={isMobile ? 'bottom' : 'right'}
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="tw:text-muted-foreground tw:text-xs">
                                Teams
                            </DropdownMenuLabel>
                            {teams.map((team) => (
                                <DropdownMenuItem
                                    key={team.id}
                                    onClick={() => selectTeam(team.id)}
                                    className="tw:gap-2 tw:p-2"
                                >
                                    <div className="tw:flex tw:size-6 tw:items-center tw:justify-center tw:rounded-md tw:border">
                                        <UsersIcon className="tw:size-3.5 tw:shrink-0" />
                                    </div>
                                    {team.name}
                                    {selectedTeam.id === team.id && (
                                        <CheckIcon className="tw:ml-auto" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="tw:gap-2 tw:p-2"
                                onClick={() => {
                                    selectPage('teamlist');
                                    setOpenMobile(false);
                                }}
                            >
                                <div className="tw:flex tw:size-6 tw:items-center tw:justify-center tw:rounded-md tw:border tw:bg-transparent">
                                    <SettingsIcon className="tw:size-3.5" />
                                </div>
                                <div className="tw:text-muted-foreground tw:font-medium">
                                    Teams Verwalten
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <SidebarMenuButton
                        size="lg"
                        className="tw:data-[state=open]:bg-sidebar-accent tw:data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <div className="tw:bg-sidebar-primary tw:text-sidebar-primary-foreground tw:flex tw:aspect-square tw:size-8 tw:items-center tw:justify-center tw:rounded-lg">
                            <UsersIcon className="tw:size-4" />
                        </div>
                        <div className="tw:grid tw:flex-1 tw:text-left tw:text-sm tw:leading-tight">
                            <span className="tw:truncate tw:font-medium">
                                Laden...
                            </span>
                            <span className="tw:truncate tw:text-xs">
                                Wird geladen...
                            </span>
                        </div>
                    </SidebarMenuButton>
                )}
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
