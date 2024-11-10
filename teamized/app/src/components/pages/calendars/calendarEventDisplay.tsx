import React from 'react';

import * as Calendars from '../../../utils/calendars';
import * as Dashboard from '../../common/dashboard';
import { Team } from '../../../interfaces/teams/team';
import { CalendarEvent } from '../../../interfaces/calendar/calendarEvent';
import * as Navigation from '../../../utils/navigation';

interface Props {
    team: Team;
    event: CalendarEvent;
}

export default function CalendarEventDisplay({ team, event }: Props) {
    const editEvent = () => {
        Calendars.editEventPopup(team, event.calendar!, event).then(
            Navigation.renderPage
        );
    };

    const cloneEvent = () => {
        Calendars.editEventPopup(team, event.calendar!, event, true).then(
            Navigation.renderPage
        );
    };

    const deleteEvent = () => {
        Calendars.deleteEventPopup(team, event.calendar!, event).then(
            Navigation.renderPage
        );
    };

    if (!event) {
        return <p className="ms-1 mb-1">Kein Ereignis ausgewählt</p>;
    }

    let eventStartDisplay: string;
    let eventEndDisplay: string;

    if (event.fullday) {
        eventStartDisplay = Calendars.getDateString(new Date(event.dstart));
        eventEndDisplay = Calendars.getDateString(new Date(event.dend));
    } else {
        eventStartDisplay = Calendars.getDateTimeString(
            new Date(event.dtstart)
        );
        eventEndDisplay = Calendars.getDateTimeString(new Date(event.dtend));
    }

    return (
        <Dashboard.Table vertical={true}>
            <tbody>
                <tr>
                    <th>Name:</th>
                    <td>{event.name}</td>
                </tr>
                {event.description ? (
                    <tr>
                        <th style={{ width: '1px' }} className="pe-3">
                            Beschreibung:
                        </th>
                        <td style={{ whiteSpace: 'pre-line' }}>
                            {event.description}
                        </td>
                    </tr>
                ) : null}
                {event.location ? (
                    <tr>
                        <th>Ort:</th>
                        <td>{event.location}</td>
                    </tr>
                ) : null}
                <tr>
                    <th>Start:</th>
                    <td>{eventStartDisplay}</td>
                </tr>
                <tr>
                    <th>Ende:</th>
                    <td>{eventEndDisplay}</td>
                </tr>
                <tr className="debug-only">
                    <th>ID:</th>
                    <td>{event.id}</td>
                </tr>
            </tbody>

            <Dashboard.TableButtonFooter noTopBorder={true}>
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
            </Dashboard.TableButtonFooter>
        </Dashboard.Table>
    );
}
