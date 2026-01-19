import { DateString, ID } from '@/teamized/interfaces/common';

export interface ClubMember {
    id: ID;
    email: string;
    first_name: string;
    last_name: string;
    birth_date: DateString;
    phone?: string;
    mobile?: string;
    street?: string;
    zip_code?: string;
    city?: string;
    notes?: string;
}

export interface ClubMemberRequestDTO {
    email: string;
    first_name: string;
    last_name: string;
    birth_date: DateString;
}
