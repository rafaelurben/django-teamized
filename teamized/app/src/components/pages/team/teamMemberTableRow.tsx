import React from 'react';

import { Member } from '../../../interfaces/teams/member';
import { Team } from '../../../interfaces/teams/team';
import * as Navigation from '../../../utils/navigation';
import * as Teams from '../../../utils/teams';

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
        await Teams.promoteMemberPopup(team, member);
        Navigation.renderPage();
    };

    const handleDemoteButtonClick = async () => {
        await Teams.demoteMemberPopup(team, member);
        Navigation.renderPage();
    };

    const handleLeaveButtonClick = async () => {
        await Teams.leaveTeamPopup(team);
        Navigation.selectPage('teamlist');
    };

    const handleRemoveButtonClick = async () => {
        await Teams.deleteMemberPopup(team, member);
        Navigation.renderPage();
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
