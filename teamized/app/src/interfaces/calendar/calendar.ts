import { ID, IDIndexedObjectList } from '../common';
import { CalendarEvent } from './calendarEvent';

export interface Calendar {
    id: ID;
    name: string;
    description: string;
    color: string;
    is_public: boolean;
    ics_url: string;
    events: IDIndexedObjectList<CalendarEvent>;
}

export interface CalendarRequestDTO {
    name: string;
    description: string;
    color: string;
}
