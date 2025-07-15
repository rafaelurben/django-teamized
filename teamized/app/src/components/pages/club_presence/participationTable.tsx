import React from 'react';

import { ClubPresenceEvent } from '../../../interfaces/club/clubPresenceEvent';
import { ClubPresenceEventParticipation } from '../../../interfaces/club/clubPresenceEventParticipation';
import { ID } from '../../../interfaces/common';
import { Team } from '../../../interfaces/teams/team';
import Dashboard from '../../common/dashboard';
import IconTooltip from '../../common/tooltips/iconTooltip';
import ParticipationTableRow from './participationTableRow';

interface Props {
    participations: ClubPresenceEventParticipation[];
    isAdmin: boolean;
    team: Team;
    event: ClubPresenceEvent;
    handleDelete: (participationId: ID) => void;
    handleUpdate: (
        participationId: ID,
        updatedParticipation: ClubPresenceEventParticipation
    ) => void;
}

export default function ParticipationTable({
    participations,
    isAdmin,
    team,
    event,
    handleDelete,
    handleUpdate,
}: Props) {
    return (
        <Dashboard.Table>
            <thead>
                <tr>
                    <th>Mitglied</th>
                    <th style={{ width: '1px' }}>Antwort</th>
                    <th>Begründung</th>
                    <th style={{ width: '1px' }}>Anwesend?</th>
                    {isAdmin && (
                        <th>
                            Notiz
                            <IconTooltip
                                icon="fa-solid fa-shield"
                                title="Für Mitglied nicht sichtbar"
                                className="ms-1"
                            />
                        </th>
                    )}
                    {isAdmin && <th></th>}
                    <th className="debug-only">ID</th>
                </tr>
            </thead>
            <tbody>
                {participations.length > 0 ? (
                    participations.map((participation) => (
                        <ParticipationTableRow
                            key={participation.id}
                            participation={participation}
                            isAdmin={isAdmin}
                            team={team}
                            event={event}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <tr>
                        <td colSpan={10} className="text-center">
                            Keine Teilnehmer erfasst.
                        </td>
                    </tr>
                )}
            </tbody>
        </Dashboard.Table>
    );
}
