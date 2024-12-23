import React from 'react';

import { CalendarEvent } from '../../../interfaces/calendar/calendarEvent';
import { Team } from '../../../interfaces/teams/team';
import * as CalendarService from '../../../service/calendars.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import Dashboard from '../../common/dashboard';

interface Props {
    team: Team;
    event: CalendarEvent;
}

export default function CalendarEventDisplay({ team, event }: Props) {
    const refreshData = useAppdataRefresh();

    const editEvent = () => {
        CalendarService.editEventPopup(team, event.calendar!, event).then(
            refreshData
        );
    };

    const cloneEvent = () => {
        CalendarService.editEventPopup(team, event.calendar!, event, true).then(
            refreshData
        );
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
        <Dashboard.Table vertical={true}>
            <tbody>
                <tr>
                    <th>Name:</th>
                    <td>{event.name}</td>
                </tr>
                {event.description && (
                    <tr>
                        <th style={{ width: '1px' }} className="pe-3">
                            Beschreibung:
                        </th>
                        <td style={{ whiteSpace: 'pre-line' }}>
                            {event.description}
                        </td>
                    </tr>
                )}
                {event.location && (
                    <tr>
                        <th>Ort:</th>
                        <td>{event.location}</td>
                    </tr>
                )}
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
