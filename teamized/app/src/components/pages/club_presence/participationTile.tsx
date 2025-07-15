import React, { useReducer } from 'react';

import { ClubPresenceEvent } from '../../../interfaces/club/clubPresenceEvent';
import { Team } from '../../../interfaces/teams/team';
import * as ClubPresenceService from '../../../service/clubPresence.service';
import Dashboard from '../../common/dashboard';
import DataLoadingBoundary from '../../common/utils/dataLoadingBoundary';
import { ParticipationAdder } from './participationAdder';
import ParticipationTable from './participationTable';

interface Props {
    team: Team;
    selectedEvent: ClubPresenceEvent;
    isAdmin: boolean;
}

export function ParticipationTile({ team, selectedEvent, isAdmin }: Props) {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    const participationsPromise =
        ClubPresenceService.getClubPresenceEventParticipations(
            team.id,
            selectedEvent.id
        );

    return (
        <Dashboard.Tile
            title={'Ereignis: ' + selectedEvent.title}
            help="Verwalte die Anwesenheit für dieses Ereignis."
        >
            <DataLoadingBoundary>
                <ParticipationTable
                    participationsPromise={participationsPromise}
                    isAdmin={isAdmin}
                />
                {isAdmin && (
                    <ParticipationAdder
                        team={team}
                        event={selectedEvent}
                        participationsPromise={participationsPromise}
                        onAdded={forceUpdate}
                    />
                )}
            </DataLoadingBoundary>
        </Dashboard.Tile>
    );
}
