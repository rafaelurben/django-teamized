import React from 'react';

import { ClubGroup } from '../../../interfaces/club/clubGroup';
import { Team } from '../../../interfaces/teams/team';
import * as ClubService from '../../../service/clubs.service';
import * as NavigationService from '../../../service/navigation.service';

interface Props {
    team: Team;
    group: ClubGroup;
    isAdmin: boolean;
}

export default function ClubGroupsTableRow({ team, group, isAdmin }: Props) {
    const handleRemoveButtonClick = async () => {
        await ClubService.deleteClubGroupPopup(team, group);
        NavigationService.render();
    };

    const handleEditButtonClick = async () => {
        await ClubService.editClubGroupPopup(team, group);
        NavigationService.render();
    };

    const handleSharePortfolioButtonClick = async () => {
        await ClubService.showClubGroupPortfolioExportPopup(group);
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
