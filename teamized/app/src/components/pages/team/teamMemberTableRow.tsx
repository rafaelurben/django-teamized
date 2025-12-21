import {
    LogOut,
    MoreVertical,
    Trash2,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import React from 'react';

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/shadcn/components/ui/avatar';
import { Button } from '@/shadcn/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shadcn/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/shadcn/components/ui/table';

import { Member } from '../../../interfaces/teams/member';
import { Team } from '../../../interfaces/teams/team';
import * as TeamsService from '../../../service/teams.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import { usePageNavigator } from '../../../utils/navigation/navigationProvider';

interface Props {
    team: Team;
    member: Member;
    loggedInMember: Member;
}

export default function TeamMemberTableRow({
    team,
    member,
    loggedInMember,
}: Readonly<Props>) {
    const selectPage = usePageNavigator();
    const refreshData = useAppdataRefresh();

    const isLoggedInMember = member.id === loggedInMember.id;
    const canChangeMemberRole = !isLoggedInMember && loggedInMember.is_owner;
    const canLeave = isLoggedInMember && !loggedInMember.is_owner;
    const canKickMember =
        !isLoggedInMember &&
        (loggedInMember.is_owner ||
            (loggedInMember.is_admin && !member.is_admin));

    const handlePromoteButtonClick = () => {
        TeamsService.promoteMemberPopup(team, member).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const handleDemoteButtonClick = () => {
        TeamsService.demoteMemberPopup(team, member).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const handleLeaveButtonClick = () => {
        TeamsService.leaveTeamPopup(team).then((result) => {
            if (result.isConfirmed) {
                selectPage('teamlist');
                refreshData();
            }
        });
    };

    const handleRemoveButtonClick = () => {
        TeamsService.deleteMemberPopup(team, member).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    return (
        <TableRow>
            {/* Avatar */}
            <TableCell>
                <Avatar className="tw:size-8">
                    <AvatarImage
                        src={member.user.avatar_url}
                        alt={`Avatar von ${member.user.username}`}
                    />
                    <AvatarFallback>
                        {member.user.first_name?.[0]}
                        {member.user.last_name?.[0]}
                    </AvatarFallback>
                </Avatar>
            </TableCell>
            {/* Name */}
            <TableCell>
                <span>
                    {member.user.first_name} {member.user.last_name}
                </span>
            </TableCell>
            {/* Username and email */}
            <TableCell>
                <div className="tw:flex tw:flex-col tw:gap-0.5">
                    <span>{member.user.username}</span>
                    <a
                        href={'mailto:' + member.user.email}
                        target="_blank"
                        className="tw:text-sm tw:text-muted-foreground tw:hover:text-foreground tw:transition-colors"
                        rel="noreferrer noopener"
                    >
                        {member.user.email}
                    </a>
                </div>
            </TableCell>
            {/* Member role */}
            <TableCell>
                <span>{member.role_text}</span>
            </TableCell>
            {/* Actions dropdown */}
            <TableCell>
                {(canChangeMemberRole || canKickMember || canLeave) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                                <MoreVertical className="tw:size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {canChangeMemberRole &&
                                (member.is_admin ? (
                                    <DropdownMenuItem
                                        onClick={handleDemoteButtonClick}
                                    >
                                        <TrendingDown className="tw:size-4" />
                                        Degradieren
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem
                                        onClick={handlePromoteButtonClick}
                                    >
                                        <TrendingUp className="tw:size-4" />
                                        Befördern
                                    </DropdownMenuItem>
                                ))}
                            {isLoggedInMember && (
                                <DropdownMenuItem
                                    onClick={handleLeaveButtonClick}
                                    variant="destructive"
                                    disabled={loggedInMember.is_owner}
                                >
                                    <LogOut className="tw:size-4" />
                                    Team verlassen
                                </DropdownMenuItem>
                            )}
                            {canKickMember && (
                                <DropdownMenuItem
                                    onClick={handleRemoveButtonClick}
                                    variant="destructive"
                                >
                                    <Trash2 className="tw:size-4" />
                                    Mitglied entfernen
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </TableCell>
            {/* ID */}
            <TableCell className="debug-id">{member.id}</TableCell>
        </TableRow>
    );
}
