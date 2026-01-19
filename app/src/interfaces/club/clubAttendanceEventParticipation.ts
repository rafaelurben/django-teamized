import { ID } from '@/teamized/interfaces/common';

export enum ClubAttendanceMemberResponseChoice {
    YES = 'yes',
    NO = 'no',
    MAYBE = 'maybe',
    UNKNOWN = 'unknown',
}

export interface ClubAttendanceEventParticipation {
    id: ID;
    event_id: ID;
    member_id: ID;
    member_response: ClubAttendanceMemberResponseChoice;
    member_notes: string;
    has_attended: boolean | null;
    admin_notes: string;
}

export interface ClubAttendanceEventParticipationRequestDTO {
    member_response: ClubAttendanceMemberResponseChoice;
    member_notes: string;
    has_attended: boolean | null;
    admin_notes: string;
}
