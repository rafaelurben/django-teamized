import React from 'react';

import { ClubMember } from '../../../interfaces/club/clubMember';
import { Team } from '../../../interfaces/teams/team';
import * as ClubService from '../../../service/clubs.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import { getAge, getDateString } from '../../../utils/datetime';

interface Props {
    team: Team;
    clubMember: ClubMember;
    isAdmin: boolean;
    isOwner: boolean;
}

export default function ClubMembersTableRow({
    team,
    clubMember,
    isAdmin,
    isOwner,
}: Props) {
    const refreshData = useAppdataRefresh();

    const handleRemoveButtonClick = () => {
        ClubService.deleteClubMemberPopup(team, clubMember).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const handleEditButtonClick = () => {
        ClubService.editClubMemberPopup(team, clubMember).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const handlePortfolioEditButtonClick = async () => {
        await ClubService.editClubMemberPortfolioPopup(team, clubMember);
    };

    const handleGroupEditButtonClick = () => {
        ClubService.updateClubMemberGroupsPopup(team, clubMember).then(
            (result) => {
                if (result.isConfirmed) refreshData();
            }
        );
    };

    const handleCreateMagicLinkButtonClick = async () => {
        await ClubService.createClubMemberMagicLink(team.id, clubMember.id);
    };

    return (
        <tr>
            <td>
                <span>{clubMember.first_name}</span>
            </td>
            <td>
                <span>{clubMember.last_name}</span>
            </td>
            <td>
                {clubMember.birth_date === null ? null : (
                    <span>
                        {getDateString(new Date(clubMember.birth_date))} (
                        {getAge(clubMember.birth_date)})
                    </span>
                )}
            </td>
            <td>
                <a href={'mailto:' + clubMember.email}>{clubMember.email}</a>
            </td>

            {isOwner && (
                <>
                    {/* Action: Create magic link */}
                    <td>
                        <a
                            className="btn btn-outline-primary border-1"
                            onClick={handleCreateMagicLinkButtonClick}
                            title="Magischer Link erstellen"
                        >
                            <i className="fa-solid fa-key"></i>
                        </a>
                    </td>
                </>
            )}

            {isAdmin && (
                <>
                    {/* Action: Edit */}
                    <td>
                        <a
                            className="btn btn-outline-dark border-1"
                            onClick={handleEditButtonClick}
                            title="Mitglied bearbeiten"
                        >
                            <i className="fa-solid fa-user-pen"></i>
                        </a>
                    </td>
                    {/* Action: Portfolio Edit */}
                    <td>
                        <a
                            className="btn btn-outline-dark border-1"
                            onClick={handlePortfolioEditButtonClick}
                            title="Portfolio bearbeiten"
                        >
                            <i className="fa-solid fa-file-pen"></i>
                        </a>
                    </td>
                    {/* Action: Manage groups */}
                    <td>
                        <a
                            className="btn btn-outline-dark border-1"
                            onClick={handleGroupEditButtonClick}
                            title="Gruppen anpassen"
                        >
                            <i className="fa-solid fa-users-rectangle"></i>
                        </a>
                    </td>
                    {/* Action: Delete */}
                    <td>
                        <a
                            className="btn btn-outline-danger border-1"
                            onClick={handleRemoveButtonClick}
                            title="Mitglied entfernen"
                        >
                            <i className="fa-solid fa-trash"></i>
                        </a>
                    </td>
                </>
            )}

            {/* ID */}
            <td className="debug-id">{clubMember.id}</td>
        </tr>
    );
}
