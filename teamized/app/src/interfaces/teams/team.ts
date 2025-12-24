import { Club } from '@/teamized/interfaces/club/club';
import { ID } from '@/teamized/interfaces/common';

import { Member } from './member';

export interface Team {
    id: ID;
    name: string;
    description: string;
    club: Club | null;
    membercount: number;
    member?: Member;
}

export interface TeamRequestDTO {
    name: string;
    description: string;
}
