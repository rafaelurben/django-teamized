import React from 'react';

import * as Club from '../../../utils/club';
import * as Navigation from '../../../utils/navigation';
import { Team } from '../../../interfaces/teams/team';
import { ClubGroup } from '../../../interfaces/club/clubGroup';

interface Props {
    team: Team;
    group: ClubGroup;
    isAdmin: boolean;
}

export default function ClubGroupsTableRow({ team, group, isAdmin }: Props) {
    const handleRemoveButtonClick = async () => {
        await Club.deleteClubGroupPopup(team, group);
        Navigation.renderPage();
    };

    const handleEditButtonClick = async () => {
        await Club.editClubGroupPopup(team, group);
        Navigation.renderPage();
    };

    const handleSharePortfolioButtonClick = async () => {
        await Club.showClubGroupPortfolioExportPopup(group);
    };

    return (
        <tr>
            {/* Name */}
            <td>
                <span>{group.name}</span>
            </td>
            {/* Beschreibung */}
            <td>
                <span>{group.description}</span>
            </td>
            {isAdmin && (
                <>
                    {/* Action: Share group portfolios */}
                    <td>
                        <a
                            className="btn btn-outline-primary border-1"
                            onClick={handleSharePortfolioButtonClick}
                            title="Mitgliederportfolios teilen (API)"
                        >
                            <i className="fas fa-fw fa-share"></i>
                        </a>
                    </td>
                    {/* Action: Edit */}
                    <td>
                        <a
                            className="btn btn-outline-dark border-1"
                            onClick={handleEditButtonClick}
                            title="Gruppe bearbeiten"
                        >
                            <i className="fas fa-fw fa-pen-to-square"></i>
                        </a>
                    </td>
                    {/* Action: Delete */}
                    <td>
                        <a
                            className="btn btn-outline-danger border-1"
                            onClick={handleRemoveButtonClick}
                            title="Gruppe löschen"
                        >
                            <i className="fas fa-fw fa-trash"></i>
                        </a>
                    </td>
                </>
            )}
            {/* ID */}
            <td className="debug-only">{group.id}</td>
        </tr>
    );
}
