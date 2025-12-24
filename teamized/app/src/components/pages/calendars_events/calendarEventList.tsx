import React from 'react';

import { Skeleton } from '@/shadcn/components/ui/skeleton';
import { cn } from '@/shadcn/lib/utils';
import { CalendarEvent } from '@/teamized/interfaces/calendar/calendarEvent';
import { ID } from '@/teamized/interfaces/common';
import * as CalendarService from '@/teamized/service/calendars.service';

interface Props {
    events: CalendarEvent[];
    selectedEventID: ID | null;
    selectedDate: Date;
    loading: boolean;
    onEventSelect: (eventID: ID | null) => void;
}

export function CalendarEventList({
    events,
    selectedEventID,
    selectedDate,
    loading,
    onEventSelect,
}: Readonly<Props>) {
    if (loading) {
        return Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="tw:h-10 tw:w-full tw:rounded-md" />
        ));
    }

    if (events.length === 0) {
        return (
            <p className="tw:text-sm tw:text-muted-foreground tw:mb-0">
                Keine Ereignisse an diesem Datum.
            </p>
        );
    }

    return (
        <>
            {events.map((event) => (
                <button
                    key={event.id}
                    onClick={() => onEventSelect(event.id)}
                    className={cn(
                        'tw:relative tw:rounded-md tw:p-2 tw:pl-3 tw:text-sm tw:text-left tw:cursor-pointer tw:transition-opacity tw:bg-muted',
                        selectedEventID === event.id
                            ? 'tw:opacity-75'
                            : 'tw:opacity-100'
                    )}
                    style={{
                        borderLeft: `4px ${event.fullday ? 'solid' : 'dotted'} ${event.calendar?.color || '#3b82f6'}`,
                    }}
                >
                    <div className="tw:font-medium">{event.name}</div>
                    <div className="tw:text-muted-foreground tw:text-xs">
                        {CalendarService.getEventDateDisplay(
                            event,
                            selectedDate
                        )}
                    </div>
                    {event.location && (
                        <div className="tw:text-muted-foreground tw:text-xs tw:italic">
                            {event.location}
                        </div>
                    )}
                </button>
            ))}
        </>
    );
}
