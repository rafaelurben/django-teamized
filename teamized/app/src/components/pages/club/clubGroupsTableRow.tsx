import {
    MoreVerticalIcon,
    PencilIcon,
    Share2Icon,
    Trash2Icon,
} from 'lucide-react';
import React from 'react';

import { Button } from '@/shadcn/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shadcn/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/shadcn/components/ui/table';
import TableCellDebugID from '@/teamized/components/common/tables/TableCellDebugID';
import { ClubGroup } from '@/teamized/interfaces/club/clubGroup';
import { Team } from '@/teamized/interfaces/teams/team';
import * as ClubService from '@/teamized/service/clubs.service';
import { useAppdataRefresh } from '@/teamized/utils/appdataProvider';

interface Props {
    team: Team;
    group: ClubGroup;
    isAdmin: boolean;
}

export default function ClubGroupsTableRow({
    team,
    group,
    isAdmin,
}: Readonly<Props>) {
    const refreshData = useAppdataRefresh();

    const handleRemoveButtonClick = () => {
        ClubService.deleteClubGroupPopup(team, group).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const handleEditButtonClick = () => {
        ClubService.editClubGroupPopup(team, group).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const handleSharePortfolioButtonClick = async () => {
        await ClubService.showClubGroupPortfolioExportPopup(group);
    };

    return (
        <TableRow>
            {/* Name */}
            <TableCell>
                <span>{group.name}</span>
            </TableCell>
            {/* Beschreibung */}
            <TableCell>
                <p className="tw:whitespace-pre">{group.description}</p>
            </TableCell>
            {/* Actions dropdown */}
            <TableCell>
                {isAdmin && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                                <MoreVerticalIcon />
                                <span className="tw:sr-only">Mehr</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={handleSharePortfolioButtonClick}
                            >
                                <Share2Icon className="tw:size-4" />
                                Mitgliederportfolios teilen (API)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleEditButtonClick}>
                                <PencilIcon className="tw:size-4" />
                                Gruppe bearbeiten
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleRemoveButtonClick}
                                variant="destructive"
                            >
                                <Trash2Icon className="tw:size-4" />
                                Gruppe löschen
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </TableCell>
            {/* ID */}
            <TableCellDebugID id={group.id} />
        </TableRow>
    );
}
