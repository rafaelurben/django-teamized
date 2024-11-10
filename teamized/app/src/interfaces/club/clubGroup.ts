import { ID } from '../common';

export interface ClubGroup {
    id: ID;
    name: string;
    description: string;
    memberids: ID[];
    shared_url?: string;
}

export interface ClubGroupRequestDTO {
    name: string;
    description: string;
}
