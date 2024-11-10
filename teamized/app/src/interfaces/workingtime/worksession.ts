import { DateTimeString, ID } from '../common';

export interface Worksession {
    id: ID;
    time_start: DateTimeString;
    time_end: DateTimeString | null;
    note: string;
    is_created_via_tracking: boolean;
    is_ended: boolean;
    duration: number;
    _team_id: ID;
}

export interface WorksessionRequestDTO {
    time_start: DateTimeString;
    time_end: DateTimeString | null;
    note: string;
}
