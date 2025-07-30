import React from 'react';

import { ClubGroup } from '../../../interfaces/club/clubGroup';
import { Team } from '../../../interfaces/teams/team';
import * as ClubService from '../../../service/clubs.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';

interface Props {
    team: Team;
    group: ClubGroup;
    isAdmin: boolean;
}

export default function ClubGroupsTableRow({ team, group, isAdmin }: Props) {
    const refreshData = useAppdataRefresh();

    const handleRemoveButtonClick = () => {
        ClubService.deleteClubGroupPopup(team, group).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const handleEditButtonClick = () => {
        ClubService.editClubGroupPopup(team, group).then((result) => {
            if (result.isConfirmed) refreshData();
        });
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
                            <i className="fa-solid fa-share"></i>
                        </a>
                    </td>
                    {/* Action: Edit */}
                    <td>
                        <a
                            className="btn btn-outline-dark border-1"
                            onClick={handleEditButtonClick}
                            title="Gruppe bearbeiten"
                        >
                            <i className="fa-solid fa-pen-to-square"></i>
                        </a>
                    </td>
                    {/* Action: Delete */}
                    <td>
                        <a
                            className="btn btn-outline-danger border-1"
                            onClick={handleRemoveButtonClick}
                            title="Gruppe löschen"
                        >
                            <i className="fa-solid fa-trash"></i>
                        </a>
                    </td>
                </>
            )}
            {/* ID */}
            <td className="debug-id">{group.id}</td>
        </tr>
    );
}
