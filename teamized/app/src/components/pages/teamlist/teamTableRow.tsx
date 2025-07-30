import React from 'react';

import { Team } from '../../../interfaces/teams/team';
import * as TeamsService from '../../../service/teams.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import {
    usePageNavigator,
    useTeamSwitcher,
} from '../../../utils/navigation/navigationProvider';

interface Props {
    team: Team;
    isSelected: boolean;
}

export default function TeamTableRow({ team, isSelected }: Props) {
    const refreshData = useAppdataRefresh();

    const selectPage = usePageNavigator();
    const selectTeam = useTeamSwitcher();

    const handleSwitchToButtonClick = () => {
        selectTeam(team.id);
    };

    const handleManageButtonClick = () => {
        selectTeam(team.id);
        selectPage('team');
    };

    const handleLeaveButtonClick = () => {
        TeamsService.leaveTeamPopup(team).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const handleDeleteButtonClick = () => {
        TeamsService.deleteTeamPopup(team).then((result) => {
            if (result.isConfirmed) refreshData();
        });
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
                        <i className="fa-regular fa-circle-check"></i>
                    </a>
                </td>
            ) : (
                <td>
                    <a className="btn btn-success disabled" title="Ausgewählt">
                        <i className="fa-solid fa-circle-check"></i>
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
                        <i className="fa-solid fa-pen-to-square"></i>
                    </a>
                </td>
            ) : (
                <td>
                    <a
                        className="btn btn-outline-dark border-1"
                        onClick={handleManageButtonClick}
                        title="Ansehen"
                    >
                        <i className="fa-solid fa-eye"></i>
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
                        <i className="fa-solid fa-trash"></i>
                    </a>
                </td>
            ) : (
                <td>
                    <a
                        className="btn btn-outline-danger border-1"
                        onClick={handleLeaveButtonClick}
                        title="Team verlassen"
                    >
                        <i className="fa-solid fa-right-from-bracket"></i>
                    </a>
                </td>
            )}
            {/* ID */}
            <td className="debug-id">{team.id}</td>
        </tr>
    );
}
