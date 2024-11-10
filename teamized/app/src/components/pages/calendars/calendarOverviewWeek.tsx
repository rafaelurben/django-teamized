import React from 'react';

import { CalendarEvent } from '../../../interfaces/calendar/calendarEvent';
import * as CalendarService from '../../../service/calendars.service';
import CalendarOverviewDay from './calendarOverviewDay';

interface Props {
    firstDay: Date;
    selectedDate: Date;
    selectedMonth: Date;
    events: CalendarEvent[];
    onDateSelect: (date: Date) => unknown;
}

export default function CalendarOverviewWeek({
    firstDay,
    events,
    selectedDate,
    selectedMonth,
    onDateSelect,
}: Props) {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
        days.push(CalendarService.roundDays(firstDay, i));
    }

    return (
        <div className="d-flex justify-content-around my-3">
            {days.map((date, i) => (
                <CalendarOverviewDay
                    key={i}
                    date={date}
                    events={CalendarService.filterCalendarEventsByDate(
                        events,
                        date
                    )}
                    isToday={CalendarService.isSameDate(date, new Date())}
                    isSelected={CalendarService.isSameDate(selectedDate, date)}
                    isInSelectedMonth={CalendarService.isSameDate(
                        selectedMonth,
                        CalendarService.roundMonths(date)
                    )}
                    onSelect={onDateSelect}
                />
            ))}
        </div>
    );
}
