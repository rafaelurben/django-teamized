import React from 'react';

import { Member } from '../../../interfaces/teams/member';
import { Team } from '../../../interfaces/teams/team';
import * as NavigationService from '../../../service/navigation.service';
import * as TeamsService from '../../../service/teams.service';

interface Props {
    team: Team;
    member: Member;
    loggedInMember: Member;
}

export default function TeamMemberTableRow({
    team,
    member,
    loggedInMember,
}: Props) {
    const handlePromoteButtonClick = async () => {
        await TeamsService.promoteMemberPopup(team, member);
        NavigationService.renderPage();
    };

    const handleDemoteButtonClick = async () => {
        await TeamsService.demoteMemberPopup(team, member);
        NavigationService.renderPage();
    };

    const handleLeaveButtonClick = async () => {
        await TeamsService.leaveTeamPopup(team);
        NavigationService.selectPage('teamlist');
    };

    const handleRemoveButtonClick = async () => {
        await TeamsService.deleteMemberPopup(team, member);
        NavigationService.renderPage();
    };

    return (
        <tr>
            {/* Avatar */}
            <td>
                <img
                    src={member.user.avatar_url}
                    alt={`Avatar von ${member.user.username}`}
                    width="32"
                    height="32"
                    className="rounded-circle"
                />
            </td>
            {/* Name and description */}
            <td>
                <span>
                    {member.user.first_name} {member.user.last_name}
                </span>
            </td>
            {/* Username and email */}
            <td className="py-2">
                <span>{member.user.username}</span>
                <br />
                <a href={'mailto:' + member.user.email}>{member.user.email}</a>
            </td>
            {/* Member role */}
            <td>
                <span>{member.role_text}</span>
            </td>
            {/* Action: Promote/Demote */}
            {loggedInMember.is_owner &&
                (!member.is_owner ? (
                    !member.is_admin ? (
                        <td>
                            <a
                                className="btn btn-outline-dark border-1"
                                onClick={handlePromoteButtonClick}
                            >
                                Befördern
                            </a>
                        </td>
                    ) : (
                        <td>
                            <a
                                className="btn btn-outline-dark border-1"
                                onClick={handleDemoteButtonClick}
                            >
                                Degradieren
                            </a>
                        </td>
                    )
                ) : (
                    <td></td>
                ))}
            {/* Action: Leave / remove member */}
            {member.id === loggedInMember.id ? (
                !loggedInMember.is_owner ? (
                    <td>
                        <a
                            className="btn btn-outline-danger border-1"
                            onClick={handleLeaveButtonClick}
                            title="Team verlassen"
                        >
                            <i className="fas fa-fw fa-right-from-bracket"></i>
                        </a>
                    </td>
                ) : (
                    <td></td>
                )
            ) : loggedInMember.is_owner ||
              (loggedInMember.is_admin && !member.is_admin) ? (
                <td>
                    <a
                        className="btn btn-outline-danger border-1"
                        onClick={handleRemoveButtonClick}
                        title="Mitglied entfernen"
                    >
                        <i className="fas fa-fw fa-trash"></i>
                    </a>
                </td>
            ) : (
                <td></td>
            )}
            {/* ID */}
            <td className="debug-only">{member.id}</td>
        </tr>
    );
}
