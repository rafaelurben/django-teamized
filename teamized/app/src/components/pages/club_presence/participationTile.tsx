import React, { useEffect, useState } from 'react';

import { ClubPresenceEvent } from '../../../interfaces/club/clubPresenceEvent';
import { ClubPresenceEventParticipation } from '../../../interfaces/club/clubPresenceEventParticipation';
import { ID } from '../../../interfaces/common';
import { Team } from '../../../interfaces/teams/team';
import * as ClubPresenceService from '../../../service/clubPresence.service';
import Dashboard from '../../common/dashboard';
import { ParticipationAdder } from './participationAdder';
import ParticipationTable from './participationTable';

interface Props {
    team: Team;
    selectedEvent: ClubPresenceEvent;
    isAdmin: boolean;
}

export function ParticipationTile({ team, selectedEvent, isAdmin }: Props) {
    const [participations, setParticipations] = useState<
        ClubPresenceEventParticipation[] | null
    >(null);

    useEffect(() => {
        setParticipations(null);
        ClubPresenceService.getClubPresenceEventParticipations(
            team.id,
            selectedEvent.id
        ).then(setParticipations);
    }, [team.id, selectedEvent.id]);

    const handleParticipationDelete = (participationId: ID) => {
        setParticipations((prev) =>
            prev ? prev.filter((p) => p.id !== participationId) : null
        );
    };

    const handleParticipationUpdate = (
        participationId: ID,
        updatedParticipation: ClubPresenceEventParticipation
    ) => {
        setParticipations((prev) =>
            prev
                ? prev.map((p) =>
                      p.id === participationId ? updatedParticipation : p
                  )
                : null
        );
    };

    const handleParticipationsCreate = (
        participations: ClubPresenceEventParticipation[]
    ) => {
        setParticipations((prev) =>
            prev ? [...prev, ...participations] : participations
        );
    };

    return (
        <Dashboard.Tile
            title={'Ereignis: ' + selectedEvent.title}
            help="Verwalte die Anwesenheit für dieses Ereignis."
            loading={participations === null}
        >
            {participations !== null && (
                <>
                    <ParticipationTable
                        participations={participations}
                        isAdmin={isAdmin}
                        team={team}
                        event={selectedEvent}
                        handleDelete={handleParticipationDelete}
                        handleUpdate={handleParticipationUpdate}
                    />
                    {isAdmin && (
                        <ParticipationAdder
                            team={team}
                            event={selectedEvent}
                            participations={participations}
                            handleCreate={handleParticipationsCreate}
                        />
                    )}
                </>
            )}
        </Dashboard.Tile>
    );
}
