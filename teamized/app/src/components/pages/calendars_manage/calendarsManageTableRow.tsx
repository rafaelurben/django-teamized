import { CircleIcon, MoreVertical, Pencil, Trash2, Wifi } from 'lucide-react';
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
import Urlize from '@/teamized/components/common/utils/urlize';

import { Calendar } from '../../../interfaces/calendar/calendar';
import { Team } from '../../../interfaces/teams/team';
import * as CalendarService from '../../../service/calendars.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';

interface Props {
    calendar: Calendar;
    team: Team;
    isAdmin: boolean;
}

export default function CalendarsManageTableRow({
    calendar,
    team,
    isAdmin,
}: Readonly<Props>) {
    const refreshData = useAppdataRefresh();

    const handleEdit = () => {
        CalendarService.editCalendarPopup(team, calendar).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const handleDelete = () => {
        CalendarService.deleteCalendarPopup(team, calendar).then((result) => {
            if (result.isConfirmed) {
                refreshData();
            }
        });
    };

    const handleSubscribe = async () => {
        await CalendarService.showCalendarSubscriptionPopup(calendar);
    };

    return (
        <TableRow>
            <TableCell>
                <CircleIcon
                    className="tw:size-6 tw:fill-current"
                    style={{ color: calendar.color }}
                />
            </TableCell>
            <TableCell>{calendar.name}</TableCell>
            <TableCell>
                {calendar.description ? (
                    <Urlize text={calendar.description} />
                ) : (
                    <span className="tw:text-muted-foreground tw:italic">
                        Keine Beschreibung
                    </span>
                )}
            </TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleSubscribe}>
                            <Wifi />
                            Abonnieren
                        </DropdownMenuItem>
                        {isAdmin && (
                            <>
                                <DropdownMenuItem onClick={handleEdit}>
                                    <Pencil />
                                    Bearbeiten
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleDelete}
                                    variant="destructive"
                                >
                                    <Trash2 />
                                    Löschen
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
            <TableCellDebugID id={calendar.id} />
        </TableRow>
    );
}
