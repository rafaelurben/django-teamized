import React from 'react';

import { cn } from '@/shadcn/lib/utils';

import { CalendarEvent } from '../../../interfaces/calendar/calendarEvent';
import { ID } from '../../../interfaces/common';
import * as CalendarService from '../../../service/calendars.service';

interface Props {
    isSelected: boolean;
    onSelect: (eventID: ID | null) => unknown;
    event: CalendarEvent;
    selectedDate: Date;
}

export default function CalendarEventPickerRow({
    isSelected,
    onSelect,
    event,
    selectedDate,
}: Readonly<Props>) {
    const handleSelect = () => {
        if (isSelected) {
            onSelect(null);
        } else {
            onSelect(event.id);
        }
    };

    const getDateDisplay = () => {
        const daystart = CalendarService.roundDays(selectedDate);
        const dayend = CalendarService.roundDays(selectedDate, 1);

        if (event.fullday) {
            const evtStart = new Date(event.dstart);
            const evtEnd = new Date(event.dend);
            const sameDayStart = CalendarService.isSameDate(daystart, evtStart);
            const sameDayEnd = CalendarService.isSameDate(daystart, evtEnd);

            if (sameDayStart && sameDayEnd) {
                return 'Ganztägig';
            } else {
                return (
                    'Vom ' +
                    CalendarService.getDateString(evtStart) +
                    ' bis am ' +
                    CalendarService.getDateString(evtEnd)
                );
            }
        } else {
            const evtStart = new Date(event.dtstart);
            const evtEnd = new Date(event.dtend);
            const sameDayStart = evtStart.getTime() >= daystart.getTime();
            const sameDayEnd = evtEnd.getTime() < dayend.getTime();

            if (sameDayStart && sameDayEnd) {
                return (
                    'Von ' +
                    CalendarService.getTimeString(evtStart) +
                    ' bis ' +
                    CalendarService.getTimeString(evtEnd) +
                    ' Uhr'
                );
            } else if (sameDayStart) {
                return 'Ab ' + CalendarService.getTimeString(evtStart) + ' Uhr';
            } else if (sameDayEnd) {
                return 'Bis ' + CalendarService.getTimeString(evtEnd) + ' Uhr';
            } else {
                return 'Ganztägig';
            }
        }
    };

    return (
        <button
            className={cn(
                'tw:pl-2 tw:mb-1 tw:cursor-pointer tw:transition-opacity tw:text-left',
                isSelected ? 'tw:opacity-75' : 'tw:opacity-100'
            )}
            style={{
                borderLeftWidth: '5px',
                borderLeftStyle: event.fullday ? 'solid' : 'dotted',
                borderLeftColor: event.calendar!.color,
            }}
            onClick={handleSelect}
            tabIndex={0}
        >
            <b className="tw:inline-block tw:w-full">{event.name}</b>
            <span className="tw:inline-block tw:w-full">
                {getDateDisplay()}
            </span>
            {event.location && (
                <i className="tw:inline-block tw:w-full">{event.location}</i>
            )}
        </button>
    );
}
