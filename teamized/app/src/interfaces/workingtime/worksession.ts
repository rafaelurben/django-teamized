import { DateTimeString, ID } from '@/teamized/interfaces/common';

export interface Worksession {
    id: ID;
    time_start: DateTimeString;
    time_end: DateTimeString | null;
    note: string;
    is_created_via_tracking: boolean;
    is_ended: boolean;
    duration: number;
    unit_count: number | null;
    _team_id: ID;
}

export interface WorksessionRequestDTO {
    time_start: DateTimeString;
    time_end: DateTimeString | null;
    note: string;
    unit_count: number | null;
}
