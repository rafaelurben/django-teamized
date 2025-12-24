/**
 * Teamized Calendars API
 */

import {
    Calendar,
    CalendarRequestDTO,
} from '@/teamized/interfaces/calendar/calendar';
import {
    CalendarEvent,
    CalendarEventRequestDTO,
} from '@/teamized/interfaces/calendar/calendarEvent';
import { ID } from '@/teamized/interfaces/common';

import { API } from './_base';

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

export async function moveEvent(
    teamId: ID,
    calendarId: ID,
    eventId: ID,
    calendarId2: ID
) {
    return await API.post<{ event: CalendarEvent }>(
        `teams/${teamId}/calendars/${calendarId}/events/${eventId}/move/${calendarId2}`
    );
}

export async function deleteEvent(teamId: ID, calendarId: ID, eventId: ID) {
    return await API.delete(
        `teams/${teamId}/calendars/${calendarId}/events/${eventId}`
    );
}
