import React from 'react';

import * as Club from '../../../utils/club';
import * as Navigation from '../../../utils/navigation';
import { getAge, getDateString } from '../../../utils/datetime';
import { Team } from '../../../interfaces/teams/team';
import { ClubMember } from '../../../interfaces/club/clubMember';

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
    const handleRemoveButtonClick = async () => {
        await Club.deleteClubMemberPopup(team, clubMember);
        Navigation.renderPage();
    };

    const handleEditButtonClick = async () => {
        await Club.editClubMemberPopup(team, clubMember);
        Navigation.renderPage();
    };

    const handlePortfolioEditButtonClick = async () => {
        await Club.editClubMemberPortfolioPopup(team, clubMember);
    };

    const handleGroupEditButtonClick = async () => {
        await Club.updateClubMemberGroupsPopup(team, clubMember);
        Navigation.renderPage();
    };

    const handleCreateMagicLinkButtonClick = async () => {
        await Club.createClubMemberMagicLink(team.id, clubMember.id);
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
                            <i className="fas fa-fw fa-key"></i>
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
                            <i className="fas fa-fw fa-user-pen"></i>
                        </a>
                    </td>
                    {/* Action: Portfolio Edit */}
                    <td>
                        <a
                            className="btn btn-outline-dark border-1"
                            onClick={handlePortfolioEditButtonClick}
                            title="Portfolio bearbeiten"
                        >
                            <i className="fas fa-fw fa-file-pen"></i>
                        </a>
                    </td>
                    {/* Action: Manage groups */}
                    <td>
                        <a
                            className="btn btn-outline-dark border-1"
                            onClick={handleGroupEditButtonClick}
                            title="Gruppen anpassen"
                        >
                            <i className="fas fa-fw fa-users-rectangle"></i>
                        </a>
                    </td>
                    {/* Action: Delete */}
                    <td>
                        <a
                            className="btn btn-outline-danger border-1"
                            onClick={handleRemoveButtonClick}
                            title="Mitglied entfernen"
                        >
                            <i className="fas fa-fw fa-trash"></i>
                        </a>
                    </td>
                </>
            )}

            {/* ID */}
            <td className="debug-only">{clubMember.id}</td>
        </tr>
    );
}
