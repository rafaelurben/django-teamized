import React from 'react';

import * as ToDo from '../../../utils/todo';
import * as Navigation from '../../../utils/navigation';
import IconTooltip from '../../common/tooltips/iconTooltip';
import Tooltip from '../../common/tooltips/tooltip';
import * as Dashboard from '../../common/dashboard';
import { Team } from '../../../interfaces/teams/team';
import { Todolist } from '../../../interfaces/todolist/todolist';

interface Props {
    team: Team;
    selectedList: Todolist | null;
    onListDeleted: () => any;
    isAdmin: boolean;
}

export default function ListInfo({
    team,
    selectedList,
    onListDeleted,
    isAdmin,
}: Props) {
    const editList = () => {
        ToDo.editToDoListPopup(team, selectedList!).then(Navigation.renderPage);
    };

    const deleteList = () => {
        ToDo.deleteToDoListPopup(team, selectedList!).then(() => {
            onListDeleted();
        });
    };

    if (!selectedList) {
        return (
            <p className="ms-1 mb-0">
                Im ausgewählten Team ist noch keine To-do-Liste vorhanden.{' '}
                {isAdmin ? (
                    <IconTooltip
                        key="admin"
                        title='Du kannst mit den "Liste erstellen"-Knopf weiter oben eine neue Liste erstellen.'
                    ></IconTooltip>
                ) : (
                    <IconTooltip
                        key="noadmin"
                        title="Bitte wende dich an einen Admin dieses Teams, um eine neue Liste zu erstellen."
                    ></IconTooltip>
                )}
            </p>
        );
    }

    return (
        <Dashboard.Table vertical={true}>
            <tbody>
                <tr>
                    <th>Name:</th>
                    <td>{selectedList.name}</td>
                </tr>
                <tr>
                    <th style={{ width: '1px' }} className="pe-3">
                        Beschreibung:
                    </th>
                    <td style={{ whiteSpace: 'pre-line' }}>
                        {selectedList.description}
                    </td>
                </tr>
                <tr>
                    <th>Farbe:</th>
                    <td>
                        <i
                            style={{ color: selectedList.color }}
                            className="fas fa-circle small"
                        ></i>
                    </td>
                </tr>
                <tr className="debug-only">
                    <th>ID:</th>
                    <td>{selectedList.id}</td>
                </tr>
            </tbody>
            <Dashboard.TableButtonFooter noTopBorder={true}>
                {isAdmin ? (
                    <>
                        <button
                            className="btn btn-outline-dark me-2"
                            onClick={editList}
                        >
                            Bearbeiten
                        </button>
                        <button
                            className="btn btn-outline-danger"
                            onClick={deleteList}
                        >
                            Löschen
                        </button>
                    </>
                ) : (
                    <Tooltip title="Diese Aktionen stehen nur Admins zur Verfügung">
                        <button className="btn btn-outline-dark disabled">
                            Bearbeiten/Löschen
                        </button>
                    </Tooltip>
                )}
            </Dashboard.TableButtonFooter>
        </Dashboard.Table>
    );
}
