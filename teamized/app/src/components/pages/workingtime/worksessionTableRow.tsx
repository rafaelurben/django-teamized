import { MoreVertical, Pencil, Timer, TimerOff, Trash2 } from 'lucide-react';
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
import IconTooltip from '@/teamized/components/common/tooltips/iconTooltip';
import { Team } from '@/teamized/interfaces/teams/team';
import { Worksession } from '@/teamized/interfaces/workingtime/worksession';
import * as WorkingtimeService from '@/teamized/service/workingtime.service';
import { useAppdataRefresh } from '@/teamized/utils/appdataProvider';
import {
    getDateTimeString,
    seconds2HoursMinutesSeconds,
} from '@/teamized/utils/datetime';

interface Props {
    team: Team;
    session: Worksession;
}

export default function WorksessionTableRow({
    team,
    session,
}: Readonly<Props>) {
    const refreshData = useAppdataRefresh();

    const handleDeleteButtonClick = () => {
        WorkingtimeService.deleteWorkSessionPopup(team, session).then(
            (result) => {
                if (result.isConfirmed) refreshData();
            }
        );
    };

    const handleEditButtonClick = () => {
        WorkingtimeService.editWorkSessionPopup(team, session).then(
            (result) => {
                if (result.isConfirmed) refreshData();
            }
        );
    };

    const getDurationDisplay = () => {
        const data = seconds2HoursMinutesSeconds(session.duration);
        return `${data.hours}h ${data.minutes}min ${data.seconds}s`;
    };

    return (
        <TableRow>
            <TableCell>
                <span>
                    {getDateTimeString(new Date(session.time_start))} bis
                    <br />
                    {getDateTimeString(new Date(session.time_end!))}
                    {session.is_created_via_tracking ? (
                        <IconTooltip
                            icon={Timer}
                            title="Diese Sitzung wurde via Aufzeichnung erstellt."
                            className="tw:ms-1 tw:inline-block"
                        />
                    ) : (
                        <IconTooltip
                            icon={TimerOff}
                            title="Diese Sitzung wurde manuell erfasst."
                            className="tw:ms-1 tw:inline-block"
                        />
                    )}
                </span>
            </TableCell>
            <TableCell>
                <span>{getDurationDisplay()}</span>
            </TableCell>
            <TableCell>
                <span>{session.unit_count}</span>
            </TableCell>
            <TableCell>
                <span>{session.note}</span>
            </TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                            <MoreVertical className="tw:size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleEditButtonClick}>
                            <Pencil className="tw:size-4" />
                            Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={handleDeleteButtonClick}
                        >
                            <Trash2 className="tw:size-4" />
                            Löschen
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
            <TableCellDebugID id={session.id} />
        </TableRow>
    );
}
