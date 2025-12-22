import { CircleQuestionMark } from 'lucide-react';
import React from 'react';

import { Button } from '@/shadcn/components/ui/button';
import { Skeleton } from '@/shadcn/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from '@/shadcn/components/ui/table';
import IconTooltipWithText from '@/teamized/components/common/tooltips/iconTooltipWithText';

import { Calendar } from '../../../interfaces/calendar/calendar';
import { Team } from '../../../interfaces/teams/team';
import * as CalendarService from '../../../service/calendars.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import Tables from '../../common/tables';
import CustomTooltip from '../../common/tooltips/customTooltip';
import Urlize from '../../common/utils/urlize';

interface Props {
    team: Team;
    selectedCalendar: Calendar | null;
    onCalendarDeleted: () => unknown;
    isAdmin: boolean;
    loading?: boolean;
}

export default function CalendarInfo({
    team,
    selectedCalendar,
    onCalendarDeleted,
    isAdmin,
    loading = false,
}: Readonly<Props>) {
    const refreshData = useAppdataRefresh();

    const editCalendar = () => {
        CalendarService.editCalendarPopup(team, selectedCalendar!).then(
            (result) => {
                if (result.isConfirmed) refreshData();
            }
        );
    };

    const deleteCalendar = () => {
        CalendarService.deleteCalendarPopup(team, selectedCalendar!).then(
            (result) => {
                if (result.isConfirmed) {
                    onCalendarDeleted();
                    refreshData();
                }
            }
        );
    };

    const subscriptionPopup = async () => {
        await CalendarService.showCalendarSubscriptionPopup(selectedCalendar!);
    };

    if (loading) {
        return (
            <>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell className="tw:font-medium">
                                <Skeleton className="tw:h-4 tw:w-16" />
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
                                <Skeleton className="tw:h-4 tw:w-12" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="tw:h-3 tw:w-3" />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <div className="tw:flex tw:gap-2 tw:mt-3 tw:justify-end">
                    <Skeleton className="tw:h-9 tw:w-28" />
                    <Skeleton className="tw:h-9 tw:w-20" />
                    <Skeleton className="tw:h-9 tw:w-28" />
                </div>
            </>
        );
    }

    if (!selectedCalendar) {
        return (
            <IconTooltipWithText
                icon={CircleQuestionMark}
                title={
                    isAdmin
                        ? 'Du kannst mit den "Kalender erstellen"-Knopf weiter oben eine neue Liste erstellen.'
                        : 'Bitte wende dich an einen Admin dieses Teams, um einen neuen Kalender zu erstellen.'
                }
                text="Im ausgewählten Team ist noch kein Kalender vorhanden."
            />
        );
    }

    return (
        <Tables.VerticalDataTable
            items={[
                {
                    label: 'Name',
                    value: selectedCalendar.name,
                },
                {
                    label: 'Beschreibung',
                    value: <Urlize text={selectedCalendar.description} />,
                    limitWidth: true,
                },
                {
                    label: 'Farbe',
                    value: (
                        <i
                            style={{ color: selectedCalendar.color }}
                            className="fa-solid fa-circle small"
                        ></i>
                    ),
                },
                {
                    label: 'ID',
                    value: selectedCalendar.id,
                    isDebugId: true,
                },
            ]}
        >
            <Tables.ButtonFooter>
                {isAdmin ? (
                    <>
                        <Button variant="outline" onClick={editCalendar}>
                            Bearbeiten
                        </Button>
                        <Button variant="destructive" onClick={deleteCalendar}>
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
                <Button variant="info" onClick={subscriptionPopup}>
                    Abonnieren
                </Button>
            </Tables.ButtonFooter>
        </Tables.VerticalDataTable>
    );
}
