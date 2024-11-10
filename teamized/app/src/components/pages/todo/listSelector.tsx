import React from 'react';

import * as ToDo from '../../../utils/todo';
import ListSelectorRow from './listSelectorRow';
import Tooltip from '../../common/tooltips/tooltip';
import { Team } from '../../../interfaces/teams/team';
import { Todolist } from '../../../interfaces/todolist/todolist';
import { ID } from '../../../interfaces/common';

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
        ToDo.createToDoListPopup(team).then((todolist) => {
            onListSelect(todolist.id);
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
