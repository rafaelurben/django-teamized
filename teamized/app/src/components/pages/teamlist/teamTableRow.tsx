import React from 'react';

import * as Teams from '../../../utils/teams';
import * as Navigation from '../../../utils/navigation';
import { Team } from '../../../interfaces/teams/team';

interface Props {
    team: Team;
    isSelected: boolean;
}

export default function TeamTableRow({ team, isSelected }: Props) {
    const handleSwitchToButtonClick = () => {
        Teams.switchTeam(team.id);
    };

    const handleManageButtonClick = () => {
        Teams.switchTeam(team.id);
        Navigation.selectPage('team');
    };

    const handleLeaveButtonClick = () => {
        Teams.leaveTeamPopup(team);
    };

    const handleDeleteButtonClick = () => {
        Teams.deleteTeamPopup(team);
    };

    return (
        <tr>
            {/* Member count */}
            <td className="align-middle text-center">
                <span>{team.membercount}</span>
            </td>
            {/* Name and description */}
            <td className="py-2">
                <span>{team.name}</span>
                <br className="d-none d-lg-inline-block" />
                <i className="d-none d-lg-inline-block">{team.description}</i>
            </td>
            {/* Member role */}
            <td>
                <span>{team.member!.role_text}</span>
            </td>
            {/* Action: Switch to */}
            {isSelected ? (
                <td>
                    <a
                        className="btn btn-outline-success border-1"
                        onClick={handleSwitchToButtonClick}
                        title="Zu Team wechseln"
                    >
                        <i className="far fa-fw fa-circle-check"></i>
                    </a>
                </td>
            ) : (
                <td>
                    <a className="btn btn-success disabled" title="Ausgewählt">
                        <i className="fas fa-fw fa-circle-check"></i>
                    </a>
                </td>
            )}
            {/* Action: Edit */}
            {team.member!.is_admin ? (
                <td>
                    <a
                        className="btn btn-outline-dark border-1"
                        onClick={handleManageButtonClick}
                        title="Verwalten"
                    >
                        <i className="fas fa-fw fa-pen-to-square"></i>
                    </a>
                </td>
            ) : (
                <td>
                    <a
                        className="btn btn-outline-dark border-1"
                        onClick={handleManageButtonClick}
                        title="Ansehen"
                    >
                        <i className="fas fa-fw fa-eye"></i>
                    </a>
                </td>
            )}
            {/* Action: Leave/Delete */}
            {team.member!.is_owner ? (
                <td>
                    <a
                        className="btn btn-outline-danger border-1"
                        onClick={handleDeleteButtonClick}
                        title="Team löschen"
                    >
                        <i className="fas fa-fw fa-trash"></i>
                    </a>
                </td>
            ) : (
                <td>
                    <a
                        className="btn btn-outline-danger border-1"
                        onClick={handleLeaveButtonClick}
                        title="Team verlassen"
                    >
                        <i className="fas fa-fw fa-right-from-bracket"></i>
                    </a>
                </td>
            )}
            {/* ID */}
            <td className="debug-only">{team.id}</td>
        </tr>
    );
}
