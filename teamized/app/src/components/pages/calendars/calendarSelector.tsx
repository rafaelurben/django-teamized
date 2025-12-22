import React from 'react';

import { Button } from '@/shadcn/components/ui/button';
import { Skeleton } from '@/shadcn/components/ui/skeleton';

import { Calendar } from '../../../interfaces/calendar/calendar';
import { ID } from '../../../interfaces/common';
import { Team } from '../../../interfaces/teams/team';
import * as CalendarService from '../../../service/calendars.service';
import CustomTooltip from '../../common/tooltips/customTooltip';
import CalendarSelectorRow from './calendarSelectorRow';

interface Props {
    team: Team;
    calendars: Calendar[];
    selectedCalendar: Calendar;
    onCalendarSelect: (calendarId: ID) => unknown;
    isAdmin: boolean;
    loading?: boolean;
}

export default function CalendarSelector({
    team,
    calendars,
    selectedCalendar,
    onCalendarSelect,
    isAdmin,
    loading = false,
}: Readonly<Props>) {
    const createCalendar = () => {
        CalendarService.createCalendarPopup(team).then((result) => {
            if (result.isConfirmed) {
                onCalendarSelect(result.value!.id);
            }
        });
    };

    if (loading) {
        return (
            <>
                <div className="tw:mb-2 tw:space-y-2">
                    <Skeleton className="tw:h-8 tw:w-full" />
                    <Skeleton className="tw:h-8 tw:w-full" />
                    <Skeleton className="tw:h-8 tw:w-full" />
                </div>
                <Skeleton className="tw:h-9 tw:w-full" />
            </>
        );
    }

    return (
        <>
            {calendars.length > 0 && (
                <div className="tw:mb-2 tw:flex tw:flex-col">
                    {calendars.map((calendar) => (
                        <CalendarSelectorRow
                            key={calendar.id}
                            calendar={calendar}
                            onSelect={onCalendarSelect}
                            isSelected={selectedCalendar?.id === calendar.id}
                        />
                    ))}
                </div>
            )}
            {isAdmin ? (
                <Button variant="success" onClick={createCalendar}>
                    Kalender erstellen
                </Button>
            ) : (
                <CustomTooltip title="Diese Aktion steht nur Admins zur Verfügung">
                    <Button variant="outline" disabled>
                        Kalender erstellen
                    </Button>
                </CustomTooltip>
            )}
        </>
    );
}
