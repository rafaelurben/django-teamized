import { DateTimeString, ID } from '../common';

export interface TodolistItem {
    id: string;
    name: string;
    description: string;
    done: boolean;
    done_by_id: ID;
    done_at: DateTimeString;
}

export interface TodolistItemRequestDTO {
    name: string;
    description?: string;
    done?: boolean;
}
