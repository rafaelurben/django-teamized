import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/shadcn/components/ui/button';

import { CalendarEvent } from '../../../interfaces/calendar/calendarEvent';
import * as CalendarService from '../../../service/calendars.service';
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
}: Readonly<Props>) {
    const [selectedMonth, setSelectedMonth] = useState(
        CalendarService.roundMonths(new Date())
    );

    const go2prevMonth = () => {
        setSelectedMonth(CalendarService.roundMonths(selectedMonth, -1));
    };

    const go2today = () => {
        const date = new Date();
        setSelectedMonth(CalendarService.roundMonths(date, 0));
        onDateSelect(date);
    };

    const go2nextMonth = () => {
        setSelectedMonth(CalendarService.roundMonths(selectedMonth, 1));
    };

    const today = new Date();
    const todaySelectedInCurrentMonth =
        CalendarService.isSameDate(selectedDate, today) &&
        CalendarService.isSameDate(
            selectedMonth,
            CalendarService.roundMonths(today)
        );
    const firstDayShown = CalendarService.getMondayOfWeek(selectedMonth);

    const monthDisplay = selectedMonth.toLocaleString(undefined, {
        month: 'long',
        year: 'numeric',
    });

    return (
        <div>
            <div className="tw:flex tw:justify-between tw:items-center">
                <p className="tw:text-xl tw:font-medium">{monthDisplay}</p>
                <div className="tw:flex tw:gap-0">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={go2prevMonth}
                        className="tw:rounded-r-none"
                    >
                        <ChevronLeftIcon />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={go2today}
                        disabled={todaySelectedInCurrentMonth}
                        className="tw:rounded-none"
                    >
                        Heute
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={go2nextMonth}
                        className="tw:rounded-l-none"
                    >
                        <ChevronRightIcon />
                    </Button>
                </div>
            </div>
            <div className="tw:mt-3">
                <div className="tw:flex tw:justify-around tw:my-3">
                    {WEEKDAYS.map((day) => (
                        <div key={day}>
                            <div className="tw:flex tw:justify-center tw:items-center tw:flex-col tw:w-12 tw:h-8">
                                <b>{day}</b>
                            </div>
                        </div>
                    ))}
                </div>
                {WEEKDAY_INDEXES.map((i) => (
                    <CalendarOverviewWeek
                        key={i}
                        firstDay={CalendarService.roundDays(
                            firstDayShown,
                            i * 7
                        )}
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
