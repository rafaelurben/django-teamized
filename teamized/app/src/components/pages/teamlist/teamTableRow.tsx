import {
    Check,
    Eye,
    MoreHorizontal,
    PenSquare,
    Trash2,
    UserMinus,
} from 'lucide-react';
import React from 'react';

import { Button } from '@/shadcn/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shadcn/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/shadcn/components/ui/table';
import TableCellDebugID from '@/teamized/components/common/tables/TableCellDebugID';

import { Team } from '../../../interfaces/teams/team';
import * as TeamsService from '../../../service/teams.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import {
    usePageNavigator,
    useTeamSwitcher,
} from '../../../utils/navigation/navigationProvider';

interface Props {
    team: Team;
    isSelected: boolean;
}

export default function TeamTableRow({ team, isSelected }: Readonly<Props>) {
    const refreshData = useAppdataRefresh();

    const selectPage = usePageNavigator();
    const selectTeam = useTeamSwitcher();

    const handleSwitchToButtonClick = () => {
        selectTeam(team.id);
    };

    const handleViewManageButtonClick = () => {
        selectTeam(team.id);
        selectPage('team');
    };

    const handleLeaveButtonClick = () => {
        TeamsService.leaveTeamPopup(team).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const handleDeleteButtonClick = () => {
        TeamsService.deleteTeamPopup(team).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    return (
        <TableRow className={isSelected ? 'tw:bg-accent/100' : ''}>
            {/* Member count */}
            <TableCell className="tw:align-middle tw:text-center">
                <span>{team.membercount}</span>
            </TableCell>
            {/* Name and description */}
            <TableCell className="tw:py-2">
                <span>{team.name}</span>
                <br />
                <i>{team.description}</i>
            </TableCell>
            {/* Member role */}
            <TableCell>
                <span>{team.member!.role_text}</span>
            </TableCell>
            {/* Actions dropdown */}
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="tw:size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={handleSwitchToButtonClick}
                            disabled={isSelected}
                        >
                            <Check className="tw:size-4 tw:mr-2" />
                            <span>
                                {isSelected ? 'Ausgewählt' : 'Auswählen'}
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleViewManageButtonClick}>
                            {team.member!.is_admin ? (
                                <>
                                    <PenSquare className="tw:size-4 tw:mr-2" />
                                    <span>Verwalten</span>
                                </>
                            ) : (
                                <>
                                    <Eye className="tw:size-4 tw:mr-2" />
                                    <span>Ansehen</span>
                                </>
                            )}
                        </DropdownMenuItem>
                        {team.member!.is_owner ? (
                            <DropdownMenuItem
                                onClick={handleDeleteButtonClick}
                                variant="destructive"
                            >
                                <Trash2 className="tw:size-4 tw:mr-2" />
                                <span>Team löschen</span>
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                                onClick={handleLeaveButtonClick}
                                variant="destructive"
                            >
                                <UserMinus className="tw:size-4 tw:mr-2" />
                                <span>Team verlassen</span>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
            {/* ID */}
            <TableCellDebugID id={team.id} />
        </TableRow>
    );
}
