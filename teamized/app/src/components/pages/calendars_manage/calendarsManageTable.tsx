import React from 'react';

import { Button } from '@/shadcn/components/ui/button';
import { Skeleton } from '@/shadcn/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shadcn/components/ui/table';
import TableHeadDebugID from '@/teamized/components/common/tables/TableHeadDebugID';
import CustomTooltip from '@/teamized/components/common/tooltips/customTooltip';
import * as CalendarService from '@/teamized/service/calendars.service';
import { useAppdataRefresh } from '@/teamized/utils/appdataProvider';

import { Calendar } from '../../../interfaces/calendar/calendar';
import { Team } from '../../../interfaces/teams/team';
import Tables from '../../common/tables';
import CalendarsManageTableRow from './calendarsManageTableRow';

interface Props {
    team: Team;
    calendars: Calendar[];
    loading: boolean;
    isAdmin: boolean;
}

export default function CalendarsManageTable({
    team,
    calendars,
    loading,
    isAdmin,
}: Readonly<Props>) {
    const refreshData = useAppdataRefresh();

    const createCalendar = () => {
        CalendarService.createCalendarPopup(team).then((result) => {
            if (result.isConfirmed) {
                refreshData();
            }
        });
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="tw:w-px"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Beschreibung</TableHead>
                    <TableHead className="tw:w-px"></TableHead>
                    <TableHeadDebugID />
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <Skeleton className="tw:h-10 tw:w-10" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="tw:h-10 tw:w-full" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="tw:h-10 tw:w-full" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="tw:h-10 tw:w-10" />
                            </TableCell>
                        </TableRow>
                    ))
                ) : calendars.length === 0 ? (
                    <TableRow>
                        <TableCell
                            colSpan={5}
                            className="tw:text-center tw:text-muted-foreground"
                        >
                            Keine Kalender vorhanden.
                        </TableCell>
                    </TableRow>
                ) : (
                    calendars.map((calendar) => (
                        <CalendarsManageTableRow
                            key={calendar.id}
                            calendar={calendar}
                            team={team}
                            isAdmin={isAdmin}
                        />
                    ))
                )}
            </TableBody>
            <Tables.ButtonFooter>
                {isAdmin ? (
                    <Button variant="success" onClick={createCalendar}>
                        Kalender erstellen
                    </Button>
                ) : (
                    <CustomTooltip title="Nur Admins können Kalender erstellen.">
                        <Button variant="success" disabled>
                            Kalender erstellen
                        </Button>
                    </CustomTooltip>
                )}
            </Tables.ButtonFooter>
        </Table>
    );
}
