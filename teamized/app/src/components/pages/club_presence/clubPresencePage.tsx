import React, { useEffect, useState } from 'react';

import { ID } from '../../../interfaces/common';
import * as ClubPresenceService from '../../../service/clubPresence.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import { useCurrentTeamData } from '../../../utils/navigation/navigationProvider';
import Dashboard from '../../common/dashboard';
import EventSelector from './eventSelector';

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
    });

    const ensureValidEventId = () => {
        const isValid = Object.hasOwn(eventsMap, selectedEventId!);
        const eventIds = Object.keys(eventsMap);
        const hasEvent = eventIds.length > 0;

        if (!isValid && hasEvent) {
            // If the current event is invalid and there are event, select the first one.
            setSelectedEventId(eventIds[0]);
        } else if (!isValid) {
            // If the current event is set but there are no events, select null.
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
            <Dashboard.Column sizes={{ lg: 8 }}></Dashboard.Column>
        </Dashboard.Page>
    );
}
