import React from 'react';

import CalendarEventPickerRow from './calendarEventPickerRow';
import IconTooltip from '../../common/tooltips/iconTooltip';
import { Team } from '../../../interfaces/teams/team';
import { Calendar } from '../../../interfaces/calendar/calendar';
import { ID } from '../../../interfaces/common';
import * as Calendars from '../../../utils/calendars';
import * as Navigation from '../../../utils/navigation';
import { CalendarEvent } from '../../../interfaces/calendar/calendarEvent';

interface Props {
    team: Team;
    calendars: Calendar[];
    events: CalendarEvent[];
    onEventSelect: (eventID: ID | null) => any;
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
    const createEvent = () => {
        Calendars.createEventPopup(
            team,
            selectedDate,
            calendars,
            selectedCalendar.id
        ).then(Navigation.renderPage);
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
            Im ausgewählten Team ist noch kein Kalender vorhanden.{' '}
            {isAdmin ? (
                <IconTooltip title='Du kannst mit den "Neu erstellen"-Knopf weiter unten einen neuen Kalender erstellen.'></IconTooltip>
            ) : (
                <IconTooltip title="Bitte wende dich an einen Admin dieses Teams, um einen neuen Kalender zu erstellen."></IconTooltip>
            )}
        </p>
    );
}
