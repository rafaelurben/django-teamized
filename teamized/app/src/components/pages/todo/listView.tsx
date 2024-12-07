import React, { useId, useState } from 'react';

import { Team } from '../../../interfaces/teams/team';
import { Todolist } from '../../../interfaces/todolist/todolist';
import * as NavigationService from '../../../service/navigation.service';
import * as ToDo from '../../../service/todo.service';
import { errorAlert } from '../../../utils/alerts';
import Dashboard from '../../common/dashboard';
import IconTooltip from '../../common/tooltips/iconTooltip';
import ListViewItem from './listViewItem';

interface Props {
    team: Team;
    selectedList: Todolist | null;
    isAdmin: boolean;
}

export default function ListView({ team, selectedList, isAdmin }: Props) {
    const [isCreating, setIsCreating] = useState(false);
    const [showDone, setShowDone] = useState(false);
    const showDefaultToggleId = useId();
    const newItemNameInputId = useId();

    const updateShowDone = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShowDone((e.target as HTMLInputElement).checked);
    };

    const createItem = (e: React.FormEvent) => {
        e.preventDefault();
        const nameInput = document.getElementById(
            newItemNameInputId
        ) as HTMLInputElement;
        const name = nameInput.value;

        if (name === '') {
            errorAlert('Leeres Feld', 'Bitte gib einen Namen ein');
        } else {
            setIsCreating(true);
            ToDo.createToDoListItem(team.id, selectedList!.id, { name }).then(
                () => {
                    NavigationService.render();
                    nameInput.value = '';
                    setIsCreating(false);
                }
            );
        }
    };

    if (!selectedList) {
        return (
            <p className="ms-1 mb-0">
                Im ausgewählten Team ist noch keine To-do-Liste vorhanden.{' '}
                {isAdmin ? (
                    <IconTooltip title='Du kannst mit den "Liste erstellen"-Knopf eine neue Liste erstellen.'></IconTooltip>
                ) : (
                    <IconTooltip title="Bitte wende dich an einen Admin dieses Teams, um eine neue Liste zu erstellen."></IconTooltip>
                )}
            </p>
        );
    }

    let items = Object.values(selectedList.items);
    if (!showDone) {
        items = items.filter((item) => !item.done);
    }

    return (
        <form onSubmit={createItem}>
            <div className="form-check form-switch m-2">
                <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id={showDefaultToggleId}
                    onChange={updateShowDone}
                />
                <label
                    className="form-check-label ms-1"
                    htmlFor={showDefaultToggleId}
                >
                    Erledigte anzeigen
                </label>
            </div>

            <Dashboard.Table className="table-borderless">
                <thead>
                    <tr>
                        <th className="p-0" style={{ width: '1px' }}></th>
                        <th className="p-0"></th>
                        <th className="p-0" style={{ width: '1px' }}></th>
                        <th className="p-0" style={{ width: '1px' }}></th>
                        <th className="p-0 debug-only"></th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <ListViewItem
                            key={item.id}
                            item={item}
                            list={selectedList}
                            team={team}
                        />
                    ))}

                    {/* Create item */}
                    <tr>
                        <td>
                            <a className="btn btn-outline-success border-1 disabled">
                                <i className="far fa-fw fa-circle-check"></i>
                            </a>
                        </td>
                        <td>
                            <input
                                type="text"
                                className="form-control"
                                disabled={isCreating}
                                placeholder="Neues Element hinzufügen"
                                id={newItemNameInputId}
                                maxLength={50}
                            />
                        </td>
                        <td colSpan={2}>
                            <button
                                type="submit"
                                className="btn btn-success"
                                disabled={isCreating}
                                title="Erstellen"
                            >
                                <i className="fas fa-fw fa-plus"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </Dashboard.Table>
        </form>
    );
}
