import React from 'react';

import { Calendar } from '../../../interfaces/calendar/calendar';
import { CalendarEvent } from '../../../interfaces/calendar/calendarEvent';
import { ID } from '../../../interfaces/common';
import { Team } from '../../../interfaces/teams/team';
import * as CalendarService from '../../../service/calendars.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import IconTooltip from '../../common/tooltips/iconTooltip';
import CalendarEventPickerRow from './calendarEventPickerRow';

interface Props {
    team: Team;
    calendars: Calendar[];
    events: CalendarEvent[];
    onEventSelect: (eventID: ID | null) => unknown;
    selectedEvent: CalendarEvent | null | undefined;
    selectedCalendar: Calendar;
    selectedDate: Date;
    isAdmin: boolean;
}

export default function CalendarEventPicker({
    team,
    calendars,
    events,
    onEventSelect,
    selectedEvent,
    selectedCalendar,
    selectedDate,
    isAdmin,
}: Props) {
    const refreshData = useAppdataRefresh();

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

    const sortedEvents = events.sort((a, b) => {
        if (a.fullday && b.fullday) {
            return new Date(a.dstart).getTime() - new Date(b.dstart).getTime();
        } else if (!a.fullday && !b.fullday) {
            return (
                new Date(a.dtstart).getTime() - new Date(b.dtstart).getTime()
            );
        } else if (a.fullday) {
            return -1;
        } else {
            return 1;
        }
    });

    const calendarExists =
        selectedCalendar !== undefined && selectedCalendar !== null;
    const eventExists = events.length > 0;

    return calendarExists ? (
        <>
            {eventExists ? (
                sortedEvents.map((event) => (
                    <CalendarEventPickerRow
                        key={event.id}
                        event={event}
                        selectedDate={selectedDate}
                        onSelect={onEventSelect}
                        isSelected={
                            !!selectedEvent && selectedEvent.id === event.id
                        }
                    />
                ))
            ) : (
                <p className="ms-1 mb-1">Keine Ereignisse an diesem Datum.</p>
            )}
            <button
                className="btn btn-outline-success mt-2"
                onClick={createEvent}
            >
                Ereignis erstellen
            </button>
        </>
    ) : (
        <p className="ms-1 mb-0">
            <span className="me-1">
                Im ausgewählten Team ist noch kein Kalender vorhanden.
            </span>
            {isAdmin ? (
                <IconTooltip title='Du kannst mit den "Neu erstellen"-Knopf weiter unten einen neuen Kalender erstellen.'></IconTooltip>
            ) : (
                <IconTooltip title="Bitte wende dich an einen Admin dieses Teams, um einen neuen Kalender zu erstellen."></IconTooltip>
            )}
        </p>
    );
}
