import React, { useEffect, useRef, useState } from 'react';

import { ID } from '../../../interfaces/common';
import * as ClubAttendanceService from '../../../service/clubAttendance.service';
import * as ClubService from '../../../service/clubs.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import { useCurrentTeamData } from '../../../utils/navigation/navigationProvider';
import Dashboard from '../../common/dashboard';
import EventInfo from './eventInfo';
import EventSelector from './eventSelector';
import { ParticipationTile } from './participationTile';

export default function ClubAttendancePage() {
    const refreshData = useAppdataRefresh();

    const [selectedEventId, setSelectedEventId] = useState<ID | null>(null);

    const participationTileRef = useRef<HTMLDivElement>(null);

    const teamData = useCurrentTeamData();
    const team = teamData?.team;

    const eventsMap = teamData.club_attendance_events;
    const events = Object.values(eventsMap).toSorted((a, b) => {
        return new Date(a.dt_start).getTime() - new Date(b.dt_start).getTime();
    });
    const loading = teamData._state.club_attendance_events._initial;

    const isAdmin = team.member!.is_admin;

    useEffect(() => {
        ensureValidEventId();

        if (loading) {
            ClubAttendanceService.getAttendanceEvents(team.id).then(
                refreshData
            );
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

    const selectEvent = (eventId: ID | null) => {
        setSelectedEventId(eventId);
        participationTileRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const selectedEvent = eventsMap[selectedEventId!];

    return (
        <Dashboard.Page>
            <Dashboard.Column sizes={{ xl: 4 }}>
                <Dashboard.CustomCard
                    title="Ereignisübersicht"
                    help="Wähle ein Ereignis aus, um die Anwesenheit zu verwalten oder erstelle ein neues."
                    wrapInCardContent
                >
                    <EventSelector
                        team={team}
                        events={events}
                        selectedEvent={selectedEvent}
                        onEventSelect={selectEvent}
                        isAdmin={isAdmin}
                        loading={loading}
                    />
                </Dashboard.CustomCard>
                <Dashboard.CustomCard
                    title="Ereignisdetails"
                    help="Wähle ein Ereignis aus, um dieses zu bearbeiten oder zu löschen."
                    wrapInCardContent
                >
                    <EventInfo
                        team={team}
                        selectedEvent={selectedEvent}
                        isAdmin={isAdmin}
                        loading={loading}
                    />
                </Dashboard.CustomCard>
            </Dashboard.Column>
            <Dashboard.Column sizes={{ xl: 8 }}>
                {selectedEvent ? (
                    <ParticipationTile
                        team={team}
                        selectedEvent={selectedEvent}
                        isAdmin={isAdmin}
                        ref={participationTileRef}
                        key={selectedEvent.id} // Ensure re-render on event change
                    />
                ) : (
                    <Dashboard.CustomCard
                        title="Ausgewähltes Ereignis"
                        help="Bitte wähle ein Ereignis aus der linken Spalte."
                        wrapInCardContent
                    >
                        <span className="tw:text-muted-foreground">
                            Kein Ereignis ausgewählt.
                        </span>
                    </Dashboard.CustomCard>
                )}
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
