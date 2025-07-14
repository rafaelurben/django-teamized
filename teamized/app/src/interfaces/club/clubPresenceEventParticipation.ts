import { ID } from '../common';

export enum ClubPresenceMemberResponseChoice {
    YES = 'yes',
    NO = 'no',
    MAYBE = 'maybe',
    UNKNOWN = 'unknown',
}

export interface ClubPresenceEventParticipation {
    id: ID;
    event_id: ID;
    member_id: ID;
    member_response: ClubPresenceMemberResponseChoice;
    member_notes: string;
    has_attended: boolean | null;
    admin_notes: string;
}

export interface ClubPresenceEventParticipationRequestDTO {
    member_response: ClubPresenceMemberResponseChoice;
    member_notes: string;
    has_attended: boolean | null;
    admin_notes: string;
}
