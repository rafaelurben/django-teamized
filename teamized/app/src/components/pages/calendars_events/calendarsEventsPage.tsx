import React, { useEffect, useState } from 'react';

import { Button } from '@/shadcn/components/ui/button';
import { CalendarOverviewWithEventSelector } from '@/teamized/components/pages/calendars_events/calendarOverviewAndEventSelector';

import { ID } from '../../../interfaces/common';
import * as CalendarService from '../../../service/calendars.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import {
    useCurrentTeamData,
    usePageNavigatorAsEventHandler,
} from '../../../utils/navigation/navigationProvider';
import Dashboard from '../../common/dashboard';
import CalendarEventDisplay from './calendarEventDisplay';
import CalendarTable from './calendarTable';

export default function CalendarsEventsPage() {
    const refreshData = useAppdataRefresh();

    const [selectedCalendarId, setSelectedCalendarId] = useState<ID | null>(
        null
    );
    const [selectedEventId, setSelectedEventId] = useState<ID | null>(null);
    const [visibleCalendarIds, setVisibleCalendarIds] = useState<Set<ID>>(
        new Set()
    );

    const pageSelector = usePageNavigatorAsEventHandler();

    const teamData = useCurrentTeamData();
    const team = teamData?.team;

    const calendarsMap = teamData.calendars;
    const calendars = Object.values(calendarsMap);
    const loading = teamData._state.calendars._initial;

    const eventMap = CalendarService.flattenCalendarEvents(calendars);

    // Filter events by visible calendars
    const visibleEvents = Object.values(eventMap).filter(
        (event) => event.calendar && visibleCalendarIds.has(event.calendar.id)
    );

    useEffect(() => {
        ensureValidCalendarId();
        ensureValidEventId();

        if (loading) {
            CalendarService.getCalendars(team.id).then(refreshData);
        }
    });

    // Initialize visible calendars when calendars are loaded
    useEffect(() => {
        if (!loading && calendars.length > 0 && visibleCalendarIds.size === 0) {
            // Show all calendars by default
            setVisibleCalendarIds(new Set(calendars.map((c) => c.id)));
        }
    }, [loading, calendars, visibleCalendarIds.size]);

    const handleVisibilityToggle = (calendarId: ID, visible: boolean) => {
        setVisibleCalendarIds((prev) => {
            const newSet = new Set(prev);
            if (visible) {
                newSet.add(calendarId);
            } else {
                newSet.delete(calendarId);
            }
            return newSet;
        });
    };

    const ensureValidCalendarId = () => {
        const isValid = Object.hasOwn(calendarsMap, selectedCalendarId!);
        const calendarIds = Object.keys(calendarsMap);
        const hasCalendar = calendarIds.length > 0;

        if (!isValid && hasCalendar) {
            // If the current calendar is invalid and there are calendars, select the first one.
            setSelectedCalendarId(calendarIds[0]);
        } else if (!isValid) {
            // If the current calendar is set but there are no calendars, select null.
            setSelectedCalendarId(null);
        }
    };

    const ensureValidEventId = () => {
        if (!selectedEventId) return;

        if (!Object.hasOwn(eventMap, selectedEventId)) {
            setSelectedEventId(null);
        }
    };

    const visibleCalendars = calendars.filter((calendar) =>
        visibleCalendarIds.has(calendar.id)
    );
    const selectedCalendar = teamData.calendars[selectedCalendarId!];
    const selectedEvent = eventMap[selectedEventId!];

    return (
        <Dashboard.Page>
            <Dashboard.Column sizes={{ lg: 6, xl: 4 }}>
                <CalendarOverviewWithEventSelector
                    team={team}
                    calendars={visibleCalendars}
                    events={visibleEvents}
                    selectedCalendar={selectedCalendar}
                    selectedEventID={selectedEventId}
                    onEventIDSelect={setSelectedEventId}
                    loading={loading}
                ></CalendarOverviewWithEventSelector>
            </Dashboard.Column>
            <Dashboard.Column sizes={{ lg: 6, xl: 8 }}>
                <Dashboard.CustomCard
                    title="Ausgewähltes Ereignis"
                    help="Klicke auf ein Ereignis in der Ereignisliste, um es auszuwählen/abzuwählen."
                    className="tw:lg:order-2"
                    wrapInCardContent
                >
                    <CalendarEventDisplay
                        event={selectedEvent}
                        team={team}
                        calendars={visibleCalendars}
                    />
                </Dashboard.CustomCard>
                <Dashboard.CustomCard
                    title="Angezeigte Kalender"
                    description="Behalte den Überblick."
                    help="Wähle aus, welche Kalender angezeigt werden sollen und welcher Kalender standardmäßig für neue Ereignisse verwendet wird."
                    className="tw:lg:order-1"
                    wrapInCardContent
                    action={
                        <Button
                            variant="outline"
                            onClick={pageSelector('calendars_manage')}
                        >
                            Verwalten
                        </Button>
                    }
                >
                    <CalendarTable
                        calendars={calendars}
                        selectedCalendarId={selectedCalendarId}
                        visibleCalendarIds={visibleCalendarIds}
                        onCalendarSelect={setSelectedCalendarId}
                        onVisibilityToggle={handleVisibilityToggle}
                        loading={loading}
                    />
                </Dashboard.CustomCard>
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
