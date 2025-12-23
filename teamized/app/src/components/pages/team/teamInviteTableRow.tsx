import { Key, Link, MoreVertical, Pencil, Trash2 } from 'lucide-react';
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
import CustomTooltip from '@/teamized/components/common/tooltips/customTooltip';

import { Invite } from '../../../interfaces/teams/invite';
import { Team } from '../../../interfaces/teams/team';
import * as TeamsService from '../../../service/teams.service';
import { successAlert } from '../../../utils/alerts';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import { getDateTimeString } from '../../../utils/datetime';
import Urlize from '../../common/utils/urlize';

interface Props {
    team: Team;
    invite: Invite;
}

export default function TeamInviteTableRow({ team, invite }: Readonly<Props>) {
    const refreshData = useAppdataRefresh();

    const inviteURL = location.href.split('?')[0] + '?invite=' + invite.token;

    const handleDeleteButtonClick = () => {
        TeamsService.deleteInvitePopup(team, invite).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const handleEditButtonClick = () => {
        TeamsService.editInvitePopup(team, invite).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const copyToken = () => {
        navigator.clipboard
            .writeText(invite.token)
            .then(() =>
                successAlert(
                    'Der Token wurde in die Zwischenablage kopiert.',
                    'Token kopiert'
                )
            );
    };

    const copyURL = () => {
        navigator.clipboard
            .writeText(inviteURL)
            .then(() =>
                successAlert(
                    'Der Link wurde in die Zwischenablage kopiert.',
                    'Link kopiert'
                )
            );
    };

    return (
        <TableRow>
            {/* Note */}
            <TableCell>
                <Urlize text={invite.note} />
            </TableCell>
            {/* Token */}
            <TableCell>
                <CustomTooltip title={invite.token}>
                    {invite.token.slice(0, 10)}...
                </CustomTooltip>
            </TableCell>
            {/* Valid until */}
            <TableCell>
                <span>
                    {invite.valid_until
                        ? getDateTimeString(new Date(invite.valid_until))
                        : '\u221e'}
                </span>
            </TableCell>
            {/* Uses */}
            <TableCell>
                <span>
                    {invite.uses_used}/{invite.uses_left}
                </span>
            </TableCell>
            {/* Actions dropdown */}
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                            <MoreVertical className="tw:size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={copyToken}>
                            <Key className="tw:size-4" />
                            Token kopieren
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={copyURL}>
                            <Link className="tw:size-4" />
                            Einladungslink kopieren
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleEditButtonClick}>
                            <Pencil className="tw:size-4" />
                            Einladung bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleDeleteButtonClick}
                            variant="destructive"
                        >
                            <Trash2 className="tw:size-4" />
                            Einladung löschen
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
            {/* ID */}
            <TableCellDebugID id={invite.id} />
        </TableRow>
    );
}
