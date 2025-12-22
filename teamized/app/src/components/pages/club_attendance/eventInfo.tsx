import React from 'react';

import { Button } from '@/shadcn/components/ui/button';
import { Skeleton } from '@/shadcn/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from '@/shadcn/components/ui/table';

import { ClubAttendanceEvent } from '../../../interfaces/club/clubAttendanceEvent';
import { Team } from '../../../interfaces/teams/team';
import * as ClubAttendanceService from '../../../service/clubAttendance.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import { getDateTimeString } from '../../../utils/datetime';
import Tables from '../../common/tables';
import CustomTooltip from '../../common/tooltips/customTooltip';
import Urlize from '../../common/utils/urlize';

interface Props {
    team: Team;
    selectedEvent: ClubAttendanceEvent | null;
    isAdmin: boolean;
    loading?: boolean;
}

export default function EventInfo({
    team,
    selectedEvent,
    isAdmin,
    loading = false,
}: Readonly<Props>) {
    const refreshData = useAppdataRefresh();

    const editEvent = () => {
        ClubAttendanceService.editAttendanceEventPopup(
            team,
            selectedEvent!
        ).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const deleteEvent = () => {
        ClubAttendanceService.deleteAttendanceEventPopup(
            team,
            selectedEvent!
        ).then((result) => {
            if (result.isConfirmed) {
                refreshData();
            }
        });
    };

    if (loading) {
        return (
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell className="tw:font-medium">
                            <Skeleton className="tw:h-4 tw:w-20" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="tw:h-4 tw:w-full" />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="tw:font-medium">
                            <Skeleton className="tw:h-4 tw:w-24" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="tw:h-4 tw:w-full" />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="tw:font-medium">
                            <Skeleton className="tw:h-4 tw:w-16" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="tw:h-4 tw:w-32" />
                        </TableCell>
                    </TableRow>
                </TableBody>
                <Tables.ButtonFooter>
                    <div className="tw:flex tw:gap-2 tw:mt-3">
                        <Skeleton className="tw:h-9 tw:w-28" />
                        <Skeleton className="tw:h-9 tw:w-20" />
                    </div>
                </Tables.ButtonFooter>
            </Table>
        );
    }

    if (!selectedEvent) {
        return <span>Kein Ereignis ausgewählt.</span>;
    }

    return (
        <Tables.VerticalDataTable
            items={[
                {
                    label: 'Ereignis',
                    value: selectedEvent.title,
                },
                {
                    label: 'Beschreibung',
                    value: <Urlize text={selectedEvent.description} />,
                    limitWidth: true,
                },
                {
                    label: 'Start',
                    value: getDateTimeString(new Date(selectedEvent.dt_start)),
                },
                {
                    label: 'Ende',
                    value: getDateTimeString(new Date(selectedEvent.dt_end)),
                },
                {
                    label: 'Punkte',
                    value: selectedEvent.points,
                },
                {
                    label: 'Standardmässig teilnehmend',
                    value: selectedEvent.participating_by_default
                        ? 'Ja'
                        : 'Nein',
                },
                {
                    label: 'Gesperrt',
                    value: selectedEvent.locked ? 'Ja' : 'Nein',
                },
                {
                    label: 'ID',
                    value: selectedEvent.id,
                    isDebugId: true,
                },
            ]}
        >
            <Tables.ButtonFooter noTopBorder={true}>
                {isAdmin ? (
                    <>
                        <Button variant="outline" onClick={editEvent}>
                            Bearbeiten
                        </Button>
                        <Button variant="destructive" onClick={deleteEvent}>
                            Löschen
                        </Button>
                    </>
                ) : (
                    <CustomTooltip title="Diese Aktionen stehen nur Admins zur Verfügung">
                        <Button variant="outline" disabled>
                            Bearbeiten/Löschen
                        </Button>
                    </CustomTooltip>
                )}
            </Tables.ButtonFooter>
        </Tables.VerticalDataTable>
    );
}
