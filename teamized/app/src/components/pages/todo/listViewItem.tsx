import React from 'react';

import { Team } from '../../../interfaces/teams/team';
import { Todolist } from '../../../interfaces/todolist/todolist';
import { TodolistItem } from '../../../interfaces/todolist/todolistItem';
import * as ToDo from '../../../service/todo.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';

interface Props {
    team: Team;
    list: Todolist;
    item: TodolistItem;
}

export default function ListViewItem({ team, list, item }: Props) {
    const refreshData = useAppdataRefresh();

    const markDone = () => {
        ToDo.editToDoListItem(team.id, list.id, item.id, {
            done: true,
        }).then(refreshData);
    };

    const viewItem = () => {
        ToDo.viewToDoListItemPopup(team, list, item).then((result) => {
            if (result?.isConfirmed) refreshData();
        });
    };

    const deleteItem = () => {
        ToDo.deleteToDoListItemPopup(team, list, item).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    return (
        <tr>
            <td>
                {item.done ? (
                    <a className="btn btn-success disabled" title="Erledigt">
                        <i className="fas fa-fw fa-circle-check"></i>
                    </a>
                ) : (
                    <a
                        className="btn btn-outline-success border-1"
                        onClick={markDone}
                        title="Als erledigt markieren"
                    >
                        <i className="far fa-fw fa-circle-check"></i>
                    </a>
                )}
            </td>
            <td>
                <span>{item.name}</span>
            </td>
            <td>
                <a
                    className="btn btn-outline-dark border-1"
                    onClick={viewItem}
                    title="Ansehen oder bearbeiten"
                >
                    <i className="fas fa-fw fa-eye"></i>
                </a>
            </td>
            <td>
                <a
                    className="btn btn-outline-danger border-1"
                    onClick={deleteItem}
                    title="Löschen"
                >
                    <i className="fas fa-fw fa-trash"></i>
                </a>
            </td>
            <td className="debug-only">{item.id}</td>
        </tr>
    );
}
