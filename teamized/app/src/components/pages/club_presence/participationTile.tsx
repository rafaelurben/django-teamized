import React from 'react';

import { ClubPresenceEvent } from '../../../interfaces/club/clubPresenceEvent';
import { Team } from '../../../interfaces/teams/team';
import * as ClubPresenceService from '../../../service/clubPresence.service';
import Dashboard from '../../common/dashboard';
import DataLoadingBoundary from '../../common/utils/dataLoadingBoundary';
import ParticipationTable from './participationTable';

interface Props {
    team: Team;
    selectedEvent: ClubPresenceEvent;
    isAdmin: boolean;
}

export function ParticipationTile({ team, selectedEvent, isAdmin }: Props) {
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
            </DataLoadingBoundary>
        </Dashboard.Tile>
    );
}
