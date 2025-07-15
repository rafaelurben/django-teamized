import { DateTimeString, ID } from '../common';

export interface ClubAttendanceEvent {
    id: ID;
    title: string;
    description: string;
    participating_by_default: boolean;
    dt_start: DateTimeString;
    dt_end: DateTimeString;
    points: number;
    locked: boolean;
}

export interface ClubAttendanceEventRequestDTO {
    title: string;
    description: string;
    participating_by_default: boolean;
    dt_start: DateTimeString;
    dt_end: DateTimeString;
    points: number;
    locked: boolean;
}
