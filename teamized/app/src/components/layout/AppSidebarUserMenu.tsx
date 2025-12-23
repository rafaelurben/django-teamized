'use client';

import {
    ChevronsUpDown,
    ExternalLink,
    LogOut,
    User as UserIcon,
} from 'lucide-react';
import React from 'react';

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/shadcn/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
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
import { User } from '@/teamized/interfaces/user';

interface Props {
    user: User;
}

export function AppSidebarUserMenu({ user }: Readonly<Props>) {
    const { isMobile } = useSidebar();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="tw:data-[state=open]:bg-sidebar-accent tw:data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="tw:h-8 tw:w-8 tw:rounded-lg">
                                <AvatarImage
                                    src={user.avatar_url}
                                    alt={user.username}
                                />
                                <AvatarFallback className="tw:rounded-lg">
                                    {user.first_name[0]}
                                    {user.last_name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="tw:grid tw:flex-1 tw:text-left tw:text-sm tw:leading-tight">
                                <span className="tw:truncate tw:font-medium">
                                    {user.first_name} {user.last_name}
                                </span>
                                <span className="tw:truncate tw:text-xs">
                                    {'@'}
                                    {user.username}
                                </span>
                            </div>
                            <ChevronsUpDown className="tw:ml-auto tw:size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="tw:w-(--radix-dropdown-menu-trigger-width) tw:min-w-56 tw:rounded-lg"
                        side={isMobile ? 'bottom' : 'right'}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="tw:p-0 tw:font-normal">
                            <div className="tw:flex tw:items-center tw:gap-2 tw:px-1 tw:py-1.5 tw:text-left tw:text-sm">
                                <Avatar className="tw:h-8 tw:w-8 tw:rounded-lg">
                                    <AvatarImage
                                        src={user.avatar_url}
                                        alt={user.username}
                                    />
                                    <AvatarFallback className="tw:rounded-lg">
                                        CN
                                    </AvatarFallback>
                                </Avatar>
                                <div className="tw:grid tw:flex-1 tw:text-left tw:text-sm tw:leading-tight">
                                    <span className="tw:truncate tw:font-medium">
                                        {user.first_name} {user.last_name}
                                    </span>
                                    <span className="tw:truncate tw:text-xs">
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                onClick={() => {
                                    location.href =
                                        window.teamized_globals.account_url;
                                }}
                            >
                                <UserIcon />
                                Account
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    window.open(
                                        'https://de.gravatar.com/',
                                        '_blank',
                                        'noreferrer noopener'
                                    );
                                }}
                            >
                                <ExternalLink />
                                Avatar
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                                location.href =
                                    window.teamized_globals.logout_url;
                            }}
                        >
                            <LogOut />
                            Ausloggen
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
