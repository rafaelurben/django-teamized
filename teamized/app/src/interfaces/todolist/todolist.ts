import { ID, IDIndexedObjectList } from '../common';
import { TodolistItem } from './todolistItem';

export interface Todolist {
    id: ID;
    name: string;
    description: string;
    color: string;
    items: IDIndexedObjectList<TodolistItem>;
}

export interface TodolistRequestDTO {
    name: string;
    description: string;
    color: string;
}
