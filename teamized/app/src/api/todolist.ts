/**
 * Teamized Todolists API
 */

import { ID } from '@/teamized/interfaces/common';
import {
    Todolist,
    TodolistRequestDTO,
} from '@/teamized/interfaces/todolist/todolist';
import {
    TodolistItem,
    TodolistItemRequestDTO,
} from '@/teamized/interfaces/todolist/todolistItem';

import { API } from './_base';

// Todolists

export async function createTodolist(teamId: ID, todolist: TodolistRequestDTO) {
    return await API.post<{ todolist: Todolist }>(
        `teams/${teamId}/todolists`,
        todolist
    );
}

export async function updateTodolist(
    teamId: ID,
    todolistId: ID,
    todolist: Partial<TodolistRequestDTO>
) {
    return await API.put<{ todolist: Todolist }>(
        `teams/${teamId}/todolists/${todolistId}`,
        todolist
    );
}

export async function deleteTodolist(teamId: ID, todoListId: ID) {
    return await API.delete(`teams/${teamId}/todolists/${todoListId}`);
}

// TodolistItems

export async function createTodolistItem(
    teamId: ID,
    todolistId: ID,
    item: TodolistItemRequestDTO
) {
    return await API.post<{ item: TodolistItem }>(
        `teams/${teamId}/todolists/${todolistId}/items`,
        item
    );
}

export async function updateTodolistItem(
    teamId: ID,
    todolistId: ID,
    itemId: ID,
    item: Partial<TodolistItemRequestDTO>
) {
    return await API.put<{ item: TodolistItem }>(
        `teams/${teamId}/todolists/${todolistId}/items/${itemId}`,
        item
    );
}

export async function deleteTodolistItem(
    teamId: ID,
    todolistId: ID,
    itemId: ID
) {
    return await API.delete(
        `teams/${teamId}/todolists/${todolistId}/items/${itemId}`
    );
}
