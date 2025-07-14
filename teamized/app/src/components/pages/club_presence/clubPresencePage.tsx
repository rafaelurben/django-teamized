import React, { useEffect, useState } from 'react';

import { ID } from '../../../interfaces/common';
import * as ClubPresenceService from '../../../service/clubPresence.service';
import * as ClubService from '../../../service/clubs.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import { useCurrentTeamData } from '../../../utils/navigation/navigationProvider';
import Dashboard from '../../common/dashboard';
import EventSelector from './eventSelector';
import { ParticipationTile } from './participationTile';

export default function ClubPresencePage() {
    const refreshData = useAppdataRefresh();

    const [selectedEventId, setSelectedEventId] = useState<ID | null>(null);

    const teamData = useCurrentTeamData();
    const team = teamData?.team;

    const eventsMap = teamData.club_presence_events;
    const events = Object.values(eventsMap).toSorted((a, b) => {
        return new Date(a.dt_start).getTime() - new Date(b.dt_start).getTime();
    });
    const loading = teamData._state.club_presence_events._initial;

    const isAdmin = team.member!.is_admin;

    useEffect(() => {
        ensureValidEventId();

        if (loading) {
            ClubPresenceService.getPresenceEvents(team.id).then(refreshData);
        }

        if (teamData._state.club_members._initial) {
            ClubService.getClubMembers(team.id).then(refreshData);
        }
        if (teamData._state.club_groups._initial) {
            ClubService.getClubGroups(team.id).then(refreshData);
        }
    });

    const ensureValidEventId = () => {
        const isValid = Object.hasOwn(eventsMap, selectedEventId!);

        if (!isValid) {
            setSelectedEventId(null);
        }
    };

    const selectedEvent = eventsMap[selectedEventId!];

    return (
        <Dashboard.Page
            title="Anwesenheit"
            subtitle="Verwalte die Anwesenheit von Vereinsmitgliedern"
            loading={loading}
        >
            <Dashboard.Column sizes={{ lg: 4 }}>
                <Dashboard.Tile
                    title="Ereignisübersicht"
                    help="Wähle ein Ereignis aus, um die Anwesenheit zu verwalten oder erstelle ein neues."
                >
                    <EventSelector
                        team={team}
                        events={events}
                        selectedEvent={selectedEvent}
                        onEventSelect={setSelectedEventId}
                        isAdmin={isAdmin}
                    />
                </Dashboard.Tile>
            </Dashboard.Column>
            <Dashboard.Column sizes={{ lg: 8 }}>
                {selectedEvent ? (
                    <ParticipationTile
                        team={team}
                        selectedEvent={selectedEvent}
                        isAdmin={isAdmin}
                    />
                ) : (
                    <Dashboard.Tile
                        title="Ausgewähltes Ereignis"
                        help="Bitte wähle ein Ereignis aus der linken Spalte."
                    >
                        <p className="ms-1 mb-0">Kein Ereignis ausgewählt.</p>
                    </Dashboard.Tile>
                )}
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
