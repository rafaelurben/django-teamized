/**
 * Teamized Calendars API
 */

import { API } from './_base';
import { ID } from '../interfaces/common';
import { Calendar, CalendarRequestDTO } from '../interfaces/calendar/calendar';
import {
    CalendarEvent,
    CalendarEventRequestDTO,
} from '../interfaces/calendar/calendarEvent';

// Calendars

export async function createCalendar(teamId: ID, calendar: CalendarRequestDTO) {
    return await API.post<{ calendar: Calendar }>(
        `teams/${teamId}/calendars`,
        calendar
    );
}

export async function updateCalendar(
    teamId: ID,
    calendarId: ID,
    calendar: CalendarRequestDTO
) {
    return await API.put<{ calendar: Calendar }>(
        `teams/${teamId}/calendars/${calendarId}`,
        calendar
    );
}

export async function deleteCalendar(teamId: ID, calendarId: ID) {
    return await API.delete(`teams/${teamId}/calendars/${calendarId}`);
}

// Events

export async function createEvent(
    teamId: ID,
    calendarId: ID,
    event: CalendarEventRequestDTO
) {
    return await API.post<{ event: CalendarEvent }>(
        `teams/${teamId}/calendars/${calendarId}/events`,
        event
    );
}

export async function updateEvent(
    teamId: ID,
    calendarId: ID,
    eventId: ID,
    event: CalendarEventRequestDTO
) {
    return await API.put<{ event: CalendarEvent }>(
        `teams/${teamId}/calendars/${calendarId}/events/${eventId}`,
        event
    );
}

export async function deleteEvent(teamId: ID, calendarId: ID, eventId: ID) {
    return await API.delete(
        `teams/${teamId}/calendars/${calendarId}/events/${eventId}`
    );
}
