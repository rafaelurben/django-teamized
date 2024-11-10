import { ID } from '../common';

export interface Club {
    id: ID;
    name: string;
    description: string;
    slug: string;
    url: string;
    membercount: number;
}

export interface ClubRequestDTO {
    name: string;
    description: string;
    slug: string;
}
