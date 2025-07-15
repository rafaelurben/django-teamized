import React from 'react';

import {
    ClubPresenceEventParticipation,
    ClubPresenceMemberResponseChoice,
} from '../../../interfaces/club/clubPresenceEventParticipation';
import { useCurrentTeamData } from '../../../utils/navigation/navigationProvider';
import IconTooltip from '../../common/tooltips/iconTooltip';

function getResponseStatusIcon(
    response: ClubPresenceMemberResponseChoice,
    withColor: boolean = true
) {
    switch (response) {
        case ClubPresenceMemberResponseChoice.YES:
            return (
                <IconTooltip
                    icon="fa-regular fa-square-check"
                    title="Angemeldet"
                    className={withColor ? 'text-success' : undefined}
                />
            );
        case ClubPresenceMemberResponseChoice.NO:
            return (
                <IconTooltip
                    icon="fa-regular fa-circle-xmark"
                    title="Abgemeldet"
                    className={withColor ? 'text-danger' : undefined}
                />
            );
        case ClubPresenceMemberResponseChoice.MAYBE:
            return (
                <IconTooltip
                    icon="fa-regular fa-square-minus"
                    title="Vielleicht"
                    className={withColor ? 'text-warning' : undefined}
                />
            );
        case ClubPresenceMemberResponseChoice.UNKNOWN:
            return (
                <IconTooltip
                    icon="fa-regular fa-circle-question"
                    title="Keine Antwort"
                />
            );
    }
}

function getPresenceStatusIcon(
    attended: boolean | null,
    withColor: boolean = true
) {
    switch (attended) {
        case true:
            return (
                <IconTooltip
                    icon="fa-solid fa-square-check"
                    title="Anwesend"
                    className={withColor ? 'text-success' : undefined}
                />
            );
        case false:
            return (
                <IconTooltip
                    icon="fa-solid fa-circle-xmark"
                    title="Nicht anwesend"
                    className={withColor ? 'text-danger' : undefined}
                />
            );
        case null:
            return (
                <IconTooltip
                    icon="fa-solid fa-circle-question"
                    title="Unbekannt"
                />
            );
    }
}

interface Props {
    participation: ClubPresenceEventParticipation;
    isAdmin: boolean;
}

export default function ParticipationTableRow({
    participation,
    isAdmin,
}: Props) {
    const teamData = useCurrentTeamData();
    const member = teamData.club_members[participation.member_id];

    return (
        <tr>
            <td>
                {member.first_name} {member.last_name}
            </td>
            <td>{getResponseStatusIcon(participation.member_response)}</td>
            <td>{participation.member_notes}</td>
            <td>{getPresenceStatusIcon(participation.has_attended)}</td>
            {isAdmin && <td>{participation.admin_notes}</td>}
            <td className="debug-only">{participation.id}</td>
        </tr>
    );
}
