import { DateString, DateTimeString, ID } from '@/teamized/interfaces/common';

import { Calendar } from './calendar';

// CalendarEvent

interface CalendarEventBase {
    id: ID;
    name: string;
    description: string;
    location: string;
    calendar?: Calendar;
}

interface CalendarEventFullDay {
    fullday: true;
    dstart: DateString;
    dend: DateString;
    dtstart: null;
    dtend: null;
}

interface CalendarEventNotFullDay {
    fullday: false;
    dstart: null;
    dend: null;
    dtstart: DateTimeString;
    dtend: DateTimeString;
}

// CalendarEvent Request

export type CalendarEvent = CalendarEventBase &
    (CalendarEventFullDay | CalendarEventNotFullDay);

interface CalendarEventRequestDTOBase {
    name: string;
    description: string;
    location: string;
}

export type CalendarEventRequestDTO = CalendarEventRequestDTOBase &
    (CalendarEventFullDay | CalendarEventNotFullDay);
