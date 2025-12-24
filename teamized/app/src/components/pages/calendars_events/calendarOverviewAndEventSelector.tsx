import { de } from 'date-fns/locale';
import { CircleIcon, PlusIcon } from 'lucide-react';
import React, { useState } from 'react';
import { DayButton } from 'react-day-picker';

import { Button } from '@/shadcn/components/ui/button';
import { Calendar, CalendarDayButton } from '@/shadcn/components/ui/calendar';
import {
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/shadcn/components/ui/card';
import Dashboard from '@/teamized/components/common/dashboard';
import CustomTooltip from '@/teamized/components/common/tooltips/customTooltip';
import { Calendar as CalendarInterface } from '@/teamized/interfaces/calendar/calendar';
import { CalendarEvent } from '@/teamized/interfaces/calendar/calendarEvent';
import { ID } from '@/teamized/interfaces/common';
import { Team } from '@/teamized/interfaces/teams/team';
import * as CalendarService from '@/teamized/service/calendars.service';
import { useAppdataRefresh } from '@/teamized/utils/appdataProvider';
import { formatDate, getDateString } from '@/teamized/utils/datetime';

import { CalendarEventList } from './calendarEventList';

interface Props {
    team: Team;
    calendars: CalendarInterface[];
    selectedCalendar: CalendarInterface;
    events: CalendarEvent[];
    selectedEventID: ID | null;
    onEventIDSelect: (eventID: ID | null) => unknown;
    loading: boolean;
}

export function CalendarOverviewWithEventSelector({
    team,
    calendars,
    events,
    selectedCalendar,
    selectedEventID,
    onEventIDSelect,
    loading,
}: Readonly<Props>) {
    const refreshData = useAppdataRefresh();
    const [selectedMonth, setSelectedMonth] = useState<Date>(
        CalendarService.roundMonths(new Date())
    );
    const [selectedDate, setSelectedDate] = useState<Date>(
        CalendarService.roundDays(new Date())
    );

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        // Deselect event when date changes
        onEventIDSelect(null);
    };

    const handleEventSelect = (eventID: ID | null) => {
        if (selectedEventID === eventID) {
            onEventIDSelect(null);
        } else {
            onEventIDSelect(eventID);
        }
    };

    const createEvent = () => {
        CalendarService.createEventPopup(
            team,
            selectedDate,
            calendars,
            selectedCalendar.id
        ).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const filteredEvents = CalendarService.filterCalendarEventsByDate(
        events,
        selectedDate
    );
    const sortedEvents = CalendarService.sortCalendarEvents(filteredEvents);

    // Get event colors for each day
    const getEventColorsForDate = (date: Date): string[] => {
        const colors = CalendarService.filterCalendarEventsByDate(events, date)
            .map((event) => (event.calendar ? event.calendar.color : null))
            .filter((color) => color !== null);
        if (colors.length > 4) {
            return Array.from(new Set(colors)).slice(0, 4);
        }
        return colors;
    };

    const today = CalendarService.roundDays(new Date());
    const todayMonth = CalendarService.roundMonths(today);
    const todaySelectedInCurrentMonth =
        CalendarService.isSameDate(selectedDate, today) &&
        CalendarService.isSameDate(selectedMonth, todayMonth);

    return (
        <Dashboard.CustomCard>
            <CardHeader>
                <CardTitle>Kalender</CardTitle>
                <CardDescription>Finde deine Ereignisse.</CardDescription>
                <CardAction>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setSelectedDate(today);
                            setSelectedMonth(todayMonth);
                        }}
                        disabled={todaySelectedInCurrentMonth}
                    >
                        Heute
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <Calendar
                    mode="single"
                    required={true}
                    selected={selectedDate}
                    month={selectedMonth}
                    onMonthChange={setSelectedMonth}
                    onSelect={handleDateSelect}
                    ISOWeek
                    showWeekNumber
                    showOutsideDays
                    fixedWeeks
                    startMonth={new Date(2020, 0)}
                    endMonth={new Date(today.getFullYear() + 10, 11)}
                    captionLayout="dropdown"
                    className="tw:bg-transparent tw:w-auto tw:max-w-90 tw:mx-auto tw:px-0"
                    classNames={{
                        weekday:
                            'tw:font-medium tw:text-muted-foreground tw:rounded-md tw:flex-1 tw:text-[0.8rem] tw:select-none rdp-weekday',
                    }}
                    formatters={{
                        formatMonthDropdown: (d) =>
                            formatDate(d, { month: 'long' }),
                    }}
                    locale={de}
                    components={{
                        DayButton: (({
                            children,
                            modifiers,
                            day,
                            ...props
                        }) => {
                            const colors = getEventColorsForDate(day.date);
                            const isSelected = modifiers.selected;

                            return (
                                <CalendarDayButton
                                    day={day}
                                    modifiers={modifiers}
                                    {...props}
                                >
                                    <span>{children}</span>
                                    {!isSelected && (
                                        <span className="tw:flex tw:gap-0 tw:mt-0.5 tw:h-2">
                                            {colors.map((color, i) => (
                                                <CircleIcon
                                                    key={i}
                                                    className={`tw:fill-current tw:size-2 ${i > 0 ? 'tw:-ml-1' : ''}`}
                                                    style={{ color: color }}
                                                />
                                            ))}
                                        </span>
                                    )}
                                </CalendarDayButton>
                            );
                        }) satisfies typeof DayButton,
                    }}
                />
            </CardContent>
            <CardFooter className="tw:flex tw:flex-col tw:items-start tw:gap-3 tw:border-t tw:px-4 tw:pt-4!">
                <div className="tw:flex tw:w-full tw:items-center tw:justify-between">
                    <div className="tw:text-sm tw:font-medium">
                        Ereignisse am {getDateString(selectedDate)}
                    </div>
                    {!calendars || calendars.length === 0 ? (
                        <CustomTooltip title="Es muss mindestens ein Kalender sichtbar sein, damit Ereignisse erstellt werden können.">
                            <Button
                                variant="default"
                                disabled
                                size="icon"
                                className="tw:size-6"
                            >
                                <PlusIcon />
                                <span className="tw:sr-only">
                                    Ereignis erstellen
                                </span>
                            </Button>
                        </CustomTooltip>
                    ) : (
                        <Button
                            variant="default"
                            size="icon"
                            className="tw:size-6"
                            title="Ereignis erstellen"
                            onClick={createEvent}
                        >
                            <PlusIcon />
                            <span className="tw:sr-only">
                                Ereignis erstellen
                            </span>
                        </Button>
                    )}
                </div>
                <div className="tw:flex tw:w-full tw:flex-col tw:gap-2">
                    <CalendarEventList
                        events={sortedEvents}
                        selectedEventID={selectedEventID}
                        onEventSelect={handleEventSelect}
                        selectedDate={selectedDate}
                        loading={loading}
                    />
                </div>
            </CardFooter>
        </Dashboard.CustomCard>
    );
}
