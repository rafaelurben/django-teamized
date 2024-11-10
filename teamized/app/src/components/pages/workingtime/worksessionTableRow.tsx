import React from 'react';

import { Team } from '../../../interfaces/teams/team';
import { Worksession } from '../../../interfaces/workingtime/worksession';
import * as NavigationService from '../../../service/navigation.service';
import * as WorkingtimeService from '../../../service/workingtime.service';
import { seconds2HoursMinutesSeconds } from '../../../utils/datetime';
import IconTooltip from '../../common/tooltips/iconTooltip';

interface Props {
    team: Team;
    session: Worksession;
}

export default function WorksessionTableRow({ team, session }: Props) {
    const handleDeleteButtonClick = async () => {
        await WorkingtimeService.deleteWorkSessionPopup(team, session);
        NavigationService.renderPage();
    };

    const handleEditButtonClick = async () => {
        await WorkingtimeService.editWorkSessionPopup(team, session);
        NavigationService.renderPage();
    };

    const getDurationDisplay = () => {
        const data = seconds2HoursMinutesSeconds(session.duration);
        return `${data.hours}h ${data.minutes}min ${data.seconds}s`;
    };

    return (
        <tr>
            <td>
                <span>
                    {new Date(session.time_start).toLocaleString()} bis
                    <br />
                    {new Date(session.time_end!).toLocaleString()}
                    {session.is_created_via_tracking ? (
                        <IconTooltip
                            icon="fas fa-stopwatch"
                            title="Diese Sitzung wurde via Aufzeichnung erstellt."
                            className="ms-1"
                        ></IconTooltip>
                    ) : (
                        <IconTooltip
                            icon="fas fa-pencil"
                            title="Diese Sitzung wurde manuell erfasst."
                            className="ms-1"
                        ></IconTooltip>
                    )}
                </span>
            </td>
            <td>
                <span>{getDurationDisplay()}</span>
            </td>
            <td>
                <span>{session.note}</span>
            </td>
            {/* Action: Edit */}
            <td>
                <a
                    className="btn btn-outline-dark border-1"
                    onClick={handleEditButtonClick}
                    title="Sitzung bearbeiten"
                >
                    <i className="fas fa-fw fa-pen-to-square"></i>
                </a>
            </td>
            {/* Action: Delete */}
            <td>
                <a
                    className="btn btn-outline-danger border-1"
                    onClick={handleDeleteButtonClick}
                    title="Sitzung löschen"
                >
                    <i className="fas fa-fw fa-trash"></i>
                </a>
            </td>
            {/* ID */}
            <td className="debug-only">{session.id}</td>
        </tr>
    );
}
