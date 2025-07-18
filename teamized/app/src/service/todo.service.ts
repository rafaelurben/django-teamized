/**
 * Functions used in the todo module
 */

import * as TodolistAPI from '../api/todolist';
import { CacheCategory } from '../interfaces/cache/cacheCategory';
import { ID } from '../interfaces/common';
import { Team } from '../interfaces/teams/team';
import { Todolist, TodolistRequestDTO } from '../interfaces/todolist/todolist';
import {
    TodolistItem,
    TodolistItemRequestDTO,
} from '../interfaces/todolist/todolistItem';
import {
    confirmAlert,
    doubleConfirmAlert,
    fireAlert,
    Swal,
    SweetAlertResult,
} from '../utils/alerts';
import { getDateString } from '../utils/datetime';
import * as CacheService from './cache.service';

// ToDoList list

export async function getToDoLists(teamId: ID) {
    return await CacheService.refreshTeamCacheCategory<Todolist>(
        teamId,
        CacheCategory.TODOLISTS
    );
}

// ToDoList creation

export async function createToDoList(teamId: ID, todolist: TodolistRequestDTO) {
    return await TodolistAPI.createTodolist(teamId, todolist).then((data) => {
        CacheService.getTeamData(teamId).todolists[data.todolist.id] =
            data.todolist;
        return data.todolist;
    });
}

export async function createToDoListPopup(team: Team) {
    return await fireAlert<Todolist>({
        title: `To-do-Liste erstellen`,
        html: `
            <p>Team: ${team.name}</p><hr />
            <label class="swal2-input-label" for="swal-input-name">Name:</label>
            <input type="text" id="swal-input-name" class="swal2-input" placeholder="Listenname">
            <label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>
            <textarea id="swal-input-description" class="swal2-textarea" placeholder="Listenbeschreibung"></textarea>
            <label class="swal2-input-label" for="swal-input-color">Farbe:</label>
            <input type="color" id="swal-input-color" class="swal2-input form-control-color">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Erstellen',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const name = (<HTMLInputElement>(
                document.getElementById('swal-input-name')
            )).value;
            const description = (<HTMLInputElement>(
                document.getElementById('swal-input-description')
            )).value;
            const color = (<HTMLInputElement>(
                document.getElementById('swal-input-color')
            )).value;

            if (!name) {
                Swal.showValidationMessage('Bitte gib einen Namen ein!');
                return false;
            }

            Swal.showLoading();
            return await createToDoList(team.id, {
                name,
                description,
                color,
            });
        },
    });
}

// ToDoList edit

export async function editToDoList(
    teamId: ID,
    todolistId: ID,
    todolist: Partial<TodolistRequestDTO>
) {
    return await TodolistAPI.updateTodolist(teamId, todolistId, todolist).then(
        (data) => {
            CacheService.getTeamData(teamId).todolists[data.todolist.id] =
                data.todolist;
            return data.todolist;
        }
    );
}

export async function editToDoListPopup(team: Team, todolist: Todolist) {
    return await fireAlert<Todolist>({
        title: `To-do-Liste bearbeiten`,
        html: `
            <p>Team: ${team.name}</p><hr />
            <label class="swal2-input-label" for="swal-input-name">Name:</label>
            <input type="text" id="swal-input-name" class="swal2-input" placeholder="${todolist.name}" value="${todolist.name}">
            <label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>
            <textarea id="swal-input-description" class="swal2-textarea" placeholder="${todolist.description}">${todolist.description}</textarea>
            <label class="swal2-input-label" for="swal-input-color">Farbe:</label>
            <input type="color" id="swal-input-color" class="swal2-input form-control-color" value="${todolist.color}">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Speichern',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const name = (<HTMLInputElement>(
                document.getElementById('swal-input-name')
            )).value;
            const description = (<HTMLInputElement>(
                document.getElementById('swal-input-description')
            )).value;
            const color = (<HTMLInputElement>(
                document.getElementById('swal-input-color')
            )).value;

            if (!name) {
                Swal.showValidationMessage('Bitte gib einen Namen ein!');
                return false;
            }

            Swal.showLoading();
            return await editToDoList(team.id, todolist.id, {
                name,
                description,
                color,
            });
        },
    });
}

// ToDoList deletion

export async function deleteToDoList(teamId: ID, todolistId: ID) {
    return await TodolistAPI.deleteTodolist(teamId, todolistId).then(() => {
        delete CacheService.getTeamData(teamId).todolists[todolistId];
    });
}

export async function deleteToDoListPopup(team: Team, todolist: Todolist) {
    return await doubleConfirmAlert(
        `Willst du folgende To-do-Liste wirklich löschen?<br /><br />
            <b>Name:</b> ${todolist.name} <br />
            <b>Beschreibung: </b>${todolist.description} <br />
            <b>Anzahl Listeneinträge: </b>${Object.keys(todolist.items).length}
        `,
        async () => await deleteToDoList(team.id, todolist.id)
    );
}

// ToDoListItem creation

export async function createToDoListItem(
    teamId: ID,
    todolistId: ID,
    item: TodolistItemRequestDTO
) {
    return await TodolistAPI.createTodolistItem(teamId, todolistId, item).then(
        (data) => {
            CacheService.getTeamData(teamId).todolists[todolistId].items[
                data.id
            ] = data.item;
            return data.item;
        }
    );
}

// ToDoListItem edit

export async function editToDoListItem(
    teamId: ID,
    todolistId: ID,
    itemId: ID,
    item: Partial<TodolistItemRequestDTO>
) {
    return await TodolistAPI.updateTodolistItem(
        teamId,
        todolistId,
        itemId,
        item
    ).then((data) => {
        CacheService.getTeamData(teamId).todolists[todolistId].items[itemId] =
            data.item;
        return data.item;
    });
}

export async function editToDoListItemPopup(
    team: Team,
    todolist: Todolist,
    item: TodolistItem
) {
    return await fireAlert<TodolistItem>({
        title: `Listeneintrag bearbeiten`,
        html: `
            <p>Team: ${team.name}</p><p>Liste: ${todolist.name}</p><hr />
            <label class="swal2-input-label" for="swal-input-name">Titel:</label>
            <input type="text" id="swal-input-name" class="swal2-input w-100" placeholder="${item.name}" value="${item.name}">
            <label class="swal2-input-label" for="swal-input-description">Zusätzliche Notiz:</label>
            <textarea id="swal-input-description" class="swal2-textarea w-100" placeholder="${item.description}">${item.description}</textarea><hr />
            <label for="swal-input-done" class="swal2-checkbox d-flex">
                <input type="checkbox" value="0" id="swal-input-done" ${item.done ? 'checked' : ''}>
                <span class="swal2-label">Erledigt</span>
            </label>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Speichern',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const name = (<HTMLInputElement>(
                document.getElementById('swal-input-name')
            )).value;
            const description = (<HTMLInputElement>(
                document.getElementById('swal-input-description')
            )).value;
            const done = (<HTMLInputElement>(
                document.getElementById('swal-input-done')
            )).checked;

            if (!name) {
                Swal.showValidationMessage('Du musst einen Titel angeben!');
                return false;
            }

            Swal.showLoading();
            return await editToDoListItem(team.id, todolist.id, item.id, {
                name,
                description,
                done,
            });
        },
    });
}

// ToDoListItem view

export async function viewToDoListItemPopup(
    team: Team,
    todolist: Todolist,
    item: TodolistItem
) {
    return await fireAlert({
        title: item.name,
        html: `
            <p style="white-space: pre-line;">${item.description || '<i>Keine zusätzliche Notiz vorhanden</i>'}</p>
            <hr />
            <span class="swal2-label">
                ${item.done ? 'Erledigt am ' + getDateString(new Date(item.done_at)) : 'Noch nicht erledigt'}
            </span>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Bearbeiten',
        cancelButtonText: 'Schliessen',
    }).then(async (result: SweetAlertResult) => {
        if (result.isConfirmed) {
            return await editToDoListItemPopup(team, todolist, item);
        }
    });
}

// ToDoListItem deletion

export async function deleteToDoListItem(
    teamId: ID,
    todolistId: ID,
    itemId: ID
) {
    return await TodolistAPI.deleteTodolistItem(
        teamId,
        todolistId,
        itemId
    ).then(() => {
        delete CacheService.getTeamData(teamId).todolists[todolistId].items[
            itemId
        ];
    });
}

export async function deleteToDoListItemPopup(
    team: Team,
    todolist: Todolist,
    item: TodolistItem
) {
    return await confirmAlert(
        'Willst du folgenden Listeneintrag wirklich löschen?<br /><br />' +
            `<b>Name:</b> ${item.name} <br /><b>Beschreibung: </b>${item.description}`,
        async () => await deleteToDoListItem(team.id, todolist.id, item.id)
    );
}
