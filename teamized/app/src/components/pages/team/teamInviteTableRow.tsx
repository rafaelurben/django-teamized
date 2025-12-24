import {
    KeyIcon,
    LinkIcon,
    MoreVerticalIcon,
    PencilIcon,
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
import CustomTooltip from '@/teamized/components/common/tooltips/customTooltip';
import Urlize from '@/teamized/components/common/utils/urlize';
import { Invite } from '@/teamized/interfaces/teams/invite';
import { Team } from '@/teamized/interfaces/teams/team';
import * as TeamsService from '@/teamized/service/teams.service';
import { successAlert } from '@/teamized/utils/alerts';
import { useAppdataRefresh } from '@/teamized/utils/appdataProvider';
import { getDateTimeString } from '@/teamized/utils/datetime';

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
                            <MoreVerticalIcon />
                            <span className="tw:sr-only">Mehr</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={copyToken}>
                            <KeyIcon className="tw:size-4" />
                            Token kopieren
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={copyURL}>
                            <LinkIcon className="tw:size-4" />
                            Einladungslink kopieren
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleEditButtonClick}>
                            <PencilIcon className="tw:size-4" />
                            Einladung bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleDeleteButtonClick}
                            variant="destructive"
                        >
                            <Trash2Icon className="tw:size-4" />
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
