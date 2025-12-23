import { DateTimeString, ID } from '@/teamized/interfaces/common';

export interface Invite {
    id: ID;
    token: string;
    note: string;
    is_valid: boolean;
    uses_left: number;
    uses_used: number;
    valid_until: DateTimeString | null;
}

export interface InviteRequestDTO {
    note: string;
    uses_left?: number;
    valid_until?: DateTimeString | null;
}
