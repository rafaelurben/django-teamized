import React, { use } from 'react';

import { ClubPresenceEventParticipation } from '../../../interfaces/club/clubPresenceEventParticipation';
import Dashboard from '../../common/dashboard';
import IconTooltip from '../../common/tooltips/iconTooltip';
import ParticipationTableRow from './participationTableRow';

interface Props {
    participationsPromise: Promise<ClubPresenceEventParticipation[]>;
    isAdmin: boolean;
}

export default function ParticipationTable({
    participationsPromise,
    isAdmin,
}: Props) {
    const participations = use(participationsPromise);

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
