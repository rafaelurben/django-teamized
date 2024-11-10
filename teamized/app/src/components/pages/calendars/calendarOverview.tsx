import React, { useState } from 'react';

import { CalendarEvent } from '../../../interfaces/calendar/calendarEvent';
import * as Calendars from '../../../utils/calendars';
import CalendarOverviewWeek from './calendarOverviewWeek';

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const WEEKDAY_INDEXES = [0, 1, 2, 3, 4, 5, 6];

interface Props {
    selectedDate: Date;
    onDateSelect: (date: Date) => unknown;
    events: CalendarEvent[];
}

export default function CalendarOverview({
    selectedDate,
    onDateSelect,
    events,
}: Props) {
    const [selectedMonth, setSelectedMonth] = useState(
        Calendars.roundMonths(new Date())
    );

    const go2prevMonth = () => {
        setSelectedMonth(Calendars.roundMonths(selectedMonth, -1));
    };

    const go2today = () => {
        const date = new Date();
        setSelectedMonth(Calendars.roundMonths(date, 0));
        onDateSelect(date);
    };

    const go2nextMonth = () => {
        setSelectedMonth(Calendars.roundMonths(selectedMonth, 1));
    };

    const today = new Date();
    const todaySelectedInCurrentMonth =
        Calendars.isSameDate(selectedDate, today) &&
        Calendars.isSameDate(selectedMonth, Calendars.roundMonths(today));
    const firstDayShown = Calendars.getMondayOfWeek(selectedMonth);

    const monthDisplay = selectedMonth.toLocaleString(undefined, {
        month: 'long',
        year: 'numeric',
    });

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0 ms-1">{monthDisplay}</h4>
                <div className="btn-group">
                    <button
                        type="button"
                        className="btn btn-outline-dark"
                        onClick={go2prevMonth}
                    >
                        <i className="fas fa-arrow-left" />
                    </button>
                    <button
                        type="button"
                        className={
                            todaySelectedInCurrentMonth
                                ? 'btn btn-outline-dark disabled'
                                : 'btn btn-outline-dark'
                        }
                        onClick={go2today}
                    >
                        Heute
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-dark"
                        onClick={go2nextMonth}
                    >
                        <i className="fas fa-arrow-right" />
                    </button>
                </div>
            </div>
            <div className="mt-3">
                <div className="d-flex justify-content-around my-3">
                    {WEEKDAYS.map((day) => (
                        <div key={day}>
                            <div
                                className="d-flex justify-content-center align-items-center flex-column"
                                style={{ width: '3em', height: '2em' }}
                            >
                                <b>{day}</b>
                            </div>
                        </div>
                    ))}
                </div>
                {WEEKDAY_INDEXES.map((i) => (
                    <CalendarOverviewWeek
                        key={i}
                        firstDay={Calendars.roundDays(firstDayShown, i * 7)}
                        selectedMonth={selectedMonth}
                        selectedDate={selectedDate}
                        onDateSelect={onDateSelect}
                        events={events}
                    />
                ))}
            </div>
        </div>
    );
}
