import React from 'react';

import { Calendar } from '../../../interfaces/calendar/calendar';
import { CalendarEvent } from '../../../interfaces/calendar/calendarEvent';
import { Team } from '../../../interfaces/teams/team';
import * as CalendarService from '../../../service/calendars.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import Tables from '../../common/tables';
import Urlize from '../../common/utils/urlize';

interface Props {
    team: Team;
    event: CalendarEvent;
    calendars: Calendar[];
}

export default function CalendarEventDisplay({
    team,
    event,
    calendars,
}: Props) {
    const refreshData = useAppdataRefresh();

    const editEvent = () => {
        CalendarService.editEventPopup(
            team,
            event.calendar!,
            calendars,
            event
        ).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const cloneEvent = () => {
        CalendarService.editEventPopup(
            team,
            event.calendar!,
            calendars,
            event,
            true
        ).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const deleteEvent = () => {
        CalendarService.deleteEventPopup(team, event.calendar!, event).then(
            (result) => {
                if (result.isConfirmed) refreshData();
            }
        );
    };

    if (!event) {
        return <p className="ms-1 mb-1">Kein Ereignis ausgewählt</p>;
    }

    let eventStartDisplay: string;
    let eventEndDisplay: string;

    if (event.fullday) {
        eventStartDisplay = CalendarService.getDateString(
            new Date(event.dstart)
        );
        eventEndDisplay = CalendarService.getDateString(new Date(event.dend));
    } else {
        eventStartDisplay = CalendarService.getDateTimeString(
            new Date(event.dtstart)
        );
        eventEndDisplay = CalendarService.getDateTimeString(
            new Date(event.dtend)
        );
    }

    return (
        <Tables.VerticalDataTable
            items={[
                { label: 'Name', value: event.name },
                {
                    label: 'Beschreibung',
                    value: <Urlize text={event.description} />,
                    hide: !event.description,
                    limitWidth: true,
                },
                {
                    label: 'Ort',
                    value: event.location,
                    hide: !event.location,
                },
                {
                    label: 'Start',
                    value: eventStartDisplay,
                },
                {
                    label: 'Ende',
                    value: eventEndDisplay,
                },
                {
                    label: 'Kalender',
                    value: (
                        <>
                            <i
                                style={{ color: event.calendar?.color }}
                                className="fas fa-circle small me-2"
                            ></i>
                            {event.calendar?.name}
                        </>
                    ),
                },
                {
                    label: 'ID',
                    value: event.id,
                    isDebugId: true,
                },
            ]}
        >
            <Tables.ButtonFooter noTopBorder={true}>
                <button className="btn btn-outline-dark" onClick={editEvent}>
                    Bearbeiten
                </button>
                <button className="btn btn-outline-dark" onClick={cloneEvent}>
                    Duplizieren
                </button>
                <button
                    className="btn btn-outline-danger"
                    onClick={deleteEvent}
                >
                    Löschen
                </button>
            </Tables.ButtonFooter>
        </Tables.VerticalDataTable>
    );
}
