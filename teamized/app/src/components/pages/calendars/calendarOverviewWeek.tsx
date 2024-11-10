import React from 'react';

import * as Calendars from '../../../utils/calendars';
import CalendarOverviewDay from './calendarOverviewDay';
import { CalendarEvent } from '../../../interfaces/calendar/calendarEvent';

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
        days.push(Calendars.roundDays(firstDay, i));
    }

    return (
        <div className="d-flex justify-content-around my-3">
            {days.map((date, i) => (
                <CalendarOverviewDay
                    key={i}
                    date={date}
                    events={Calendars.filterCalendarEventsByDate(events, date)}
                    isToday={Calendars.isSameDate(date, new Date())}
                    isSelected={Calendars.isSameDate(selectedDate, date)}
                    isInSelectedMonth={Calendars.isSameDate(
                        selectedMonth,
                        Calendars.roundMonths(date)
                    )}
                    onSelect={onDateSelect}
                />
            ))}
        </div>
    );
}
