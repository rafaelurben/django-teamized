import React from 'react';

import { ID } from '../../../interfaces/common';
import { Team } from '../../../interfaces/teams/team';
import { Todolist } from '../../../interfaces/todolist/todolist';
import * as ToDo from '../../../service/todo.service';
import Tooltip from '../../common/tooltips/tooltip';
import ListSelectorRow from './listSelectorRow';

interface Props {
    team: Team;
    lists: Todolist[];
    selectedList: Todolist | null;
    onListSelect: (listId: ID) => unknown;
    isAdmin: boolean;
}

export default function ListSelector({
    team,
    lists,
    selectedList,
    onListSelect,
    isAdmin,
}: Props) {
    const createList = () => {
        ToDo.createToDoListPopup(team).then((result) => {
            if (result.isConfirmed) {
                onListSelect(result.value!.id);
            }
        });
    };

    return (
        <>
            {lists.length > 0 && (
                <div className="mb-2">
                    {lists.map((list) => (
                        <ListSelectorRow
                            key={list.id}
                            list={list}
                            onSelect={onListSelect}
                            isSelected={selectedList?.id === list.id}
                        />
                    ))}
                </div>
            )}
            {isAdmin ? (
                <button
                    className="btn btn-outline-success"
                    onClick={createList}
                >
                    Liste erstellen
                </button>
            ) : (
                <Tooltip title="Diese Aktion steht nur Admins zur Verfügung">
                    <button className="btn btn-outline-dark disabled">
                        Liste erstellen
                    </button>
                </Tooltip>
            )}
        </>
    );
}
