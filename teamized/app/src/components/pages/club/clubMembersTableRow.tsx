import React from 'react';

import { ClubMember } from '../../../interfaces/club/clubMember';
import { Team } from '../../../interfaces/teams/team';
import * as ClubService from '../../../service/clubs.service';
import * as NavigationService from '../../../service/navigation.service';
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
    const handleRemoveButtonClick = async () => {
        await ClubService.deleteClubMemberPopup(team, clubMember);
        NavigationService.render();
    };

    const handleEditButtonClick = async () => {
        await ClubService.editClubMemberPopup(team, clubMember);
        NavigationService.render();
    };

    const handlePortfolioEditButtonClick = async () => {
        await ClubService.editClubMemberPortfolioPopup(team, clubMember);
    };

    const handleGroupEditButtonClick = async () => {
        await ClubService.updateClubMemberGroupsPopup(team, clubMember);
        NavigationService.render();
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
