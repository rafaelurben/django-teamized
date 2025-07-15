import React from 'react';

import { ClubPresenceEvent } from '../../../interfaces/club/clubPresenceEvent';
import {
    ClubPresenceEventParticipation,
    ClubPresenceMemberResponseChoice,
} from '../../../interfaces/club/clubPresenceEventParticipation';
import { Team } from '../../../interfaces/teams/team';
import { deleteClubPresenceEventParticipationPopup } from '../../../service/clubPresence.service';
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
    team: Team;
    event: ClubPresenceEvent;
}

export default function ParticipationTableRow({
    participation,
    isAdmin,
    team,
    event,
}: Props) {
    const teamData = useCurrentTeamData();
    const member = teamData.club_members[participation.member_id];

    const handleDelete = async () => {
        await deleteClubPresenceEventParticipationPopup(
            team,
            event,
            participation
        );
        // TODO: trigger a refresh or callback if needed
    };

    return (
        <tr>
            <td>
                {member.first_name} {member.last_name}
            </td>
            <td>{getResponseStatusIcon(participation.member_response)}</td>
            <td>{participation.member_notes}</td>
            <td>{getPresenceStatusIcon(participation.has_attended)}</td>
            {isAdmin && <td>{participation.admin_notes}</td>}
            {isAdmin && (
                <td style={{ width: '1px' }}>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        title="Teilnahme löschen"
                        onClick={handleDelete}
                    >
                        <i className="fa-solid fa-trash fa-sm" />
                    </button>
                </td>
            )}
            <td className="debug-only">{participation.id}</td>
        </tr>
    );
}
