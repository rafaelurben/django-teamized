import React from 'react';

import { Invite } from '../../../interfaces/teams/invite';
import { Team } from '../../../interfaces/teams/team';
import * as TeamsService from '../../../service/teams.service';
import { successAlert } from '../../../utils/alerts';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import Urlize from '../../common/utils/urlize';

interface Props {
    team: Team;
    invite: Invite;
}

export default function TeamInviteTableRow({ team, invite }: Props) {
    const refreshData = useAppdataRefresh();

    const inviteURL =
        window.location.href.split('?')[0] + '?invite=' + invite.token;

    const handleDeleteButtonClick = () => {
        TeamsService.deleteInvitePopup(team, invite).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const handleEditButtonClick = () => {
        TeamsService.editInvitePopup(team, invite).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const copyToken = () => {
        navigator.clipboard
            .writeText(invite.token)
            .then(() =>
                successAlert(
                    'Der Token wurde in die Zwischenablage kopiert.',
                    'Token kopiert'
                )
            );
    };

    const copyURL = () => {
        navigator.clipboard
            .writeText(inviteURL)
            .then(() =>
                successAlert(
                    'Der Link wurde in die Zwischenablage kopiert.',
                    'Link kopiert'
                )
            );
    };

    return (
        <tr>
            {/* Note */}
            <td>
                <Urlize text={invite.note} />
            </td>
            {/* Share */}
            <td>
                <abbr title={invite.token} className="me-1" onClick={copyToken}>
                    <i className="fas fa-key"></i>
                </abbr>
                <abbr title={inviteURL} onClick={copyURL}>
                    <i className="fas fa-link"></i>
                </abbr>
            </td>
            {/* Valid until */}
            <td>
                <span>
                    {invite.valid_until
                        ? new Date(invite.valid_until).toLocaleString()
                        : '\u221e'}
                </span>
            </td>
            {/* Uses */}
            <td className="text-align-end">
                <span>
                    {invite.uses_used}/{invite.uses_left}
                </span>
            </td>
            {/* Action: Edit */}
            <td>
                <a
                    className="btn btn-outline-dark border-1"
                    onClick={handleEditButtonClick}
                    title="Einladung bearbeiten"
                >
                    <i className="fas fa-fw fa-pen-to-square"></i>
                </a>
            </td>
            {/* Action: Delete */}
            <td>
                <a
                    className="btn btn-outline-danger border-1"
                    onClick={handleDeleteButtonClick}
                    title="Einladung löschen"
                >
                    <i className="fas fa-fw fa-trash"></i>
                </a>
            </td>
            {/* ID */}
            <td className="debug-id">{invite.id}</td>
        </tr>
    );
}
