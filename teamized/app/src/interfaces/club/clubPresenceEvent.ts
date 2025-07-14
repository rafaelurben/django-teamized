import { DateTimeString, ID } from '../common';

export interface ClubPresenceEvent {
    id: ID;
    title: string;
    description: string;
    participating_by_default: boolean;
    dt_start: DateTimeString;
    dt_end: DateTimeString;
    points: number;
    locked: boolean;
}

export interface ClubPresenceEventRequestDTO {
    title: string;
    description: string;
    participating_by_default: boolean;
    dt_start: DateTimeString;
    dt_end: DateTimeString;
    points: number;
    locked: boolean;
}
