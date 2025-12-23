import React, { useEffect, useState } from 'react';

import { CardContent } from '@/shadcn/components/ui/card';

import { ID } from '../../../interfaces/common';
import * as CalendarService from '../../../service/calendars.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import { useCurrentTeamData } from '../../../utils/navigation/navigationProvider';
import Dashboard from '../../common/dashboard';
import CalendarEventDisplay from './calendarEventDisplay';
import CalendarEventPicker from './calendarEventPicker';
import CalendarOverview from './calendarOverview';
import CalendarTable from './calendarTable';

export default function CalendarsEventsPage() {
    const refreshData = useAppdataRefresh();

    const [selectedDate, setSelectedDate] = useState(
        CalendarService.roundDays(new Date())
    );
    const [selectedCalendarId, setSelectedCalendarId] = useState<ID | null>(
        null
    );
    const [selectedEventId, setSelectedEventId] = useState<ID | null>(null);
    const [visibleCalendarIds, setVisibleCalendarIds] = useState<Set<ID>>(
        new Set()
    );

    const teamData = useCurrentTeamData();
    const team = teamData?.team;

    const calendarsMap = teamData.calendars;
    const calendars = Object.values(calendarsMap);
    const loading = teamData._state.calendars._initial;

    const isAdmin = team.member!.is_admin;

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

    const handleDateSelect = (date: Date) => {
        setSelectedDate(CalendarService.roundDays(date));
        // If the current selected event is not in the new selected date, deselect it
        if (selectedEventId) {
            const evt = eventMap[selectedEventId];
            if (evt && !CalendarService.isDateInEvent(date, evt)) {
                setSelectedEventId(null);
            }
        }
    };

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

    const dayDisplay = CalendarService.getDateString(selectedDate);

    const selectedCalendar = teamData.calendars[selectedCalendarId!];
    const selectedEvent = eventMap[selectedEventId!];

    return (
        <Dashboard.Page>
            <Dashboard.Column sizes={{ lg: 6 }} className="tw:lg:order-2">
                <Dashboard.CustomCard
                    title="Ereignisübersicht"
                    help="Hier werden Ereignisse aus allen sichtbaren Kalendern angezeigt"
                >
                    <CardContent>
                        <CalendarOverview
                            onDateSelect={handleDateSelect}
                            selectedDate={selectedDate}
                            events={visibleEvents}
                        />
                    </CardContent>
                </Dashboard.CustomCard>
                <Dashboard.CustomCard
                    title={'Ereignisse am ' + dayDisplay}
                    help="Klicke auf einen Tag in der Ereignisübersicht, um zu diesem zu wechseln."
                >
                    <CardContent>
                        <CalendarEventPicker
                            onEventSelect={setSelectedEventId}
                            selectedDate={selectedDate}
                            selectedEvent={selectedEvent}
                            selectedCalendar={selectedCalendar}
                            calendars={calendars}
                            events={CalendarService.filterCalendarEventsByDate(
                                visibleEvents,
                                selectedDate
                            )}
                            team={team}
                            isAdmin={isAdmin}
                        />
                    </CardContent>
                </Dashboard.CustomCard>
            </Dashboard.Column>
            <Dashboard.Column sizes={{ lg: 6 }}>
                <Dashboard.CustomCard
                    title="Ausgewähltes Ereignis"
                    help="Klicke auf ein Ereignis in der Ereignisliste, um es auszuwählen/abzuwählen."
                    className="tw:lg:order-3"
                >
                    <CardContent>
                        <CalendarEventDisplay
                            event={selectedEvent}
                            team={team}
                            calendars={calendars}
                        />
                    </CardContent>
                </Dashboard.CustomCard>
                <Dashboard.CustomCard
                    title="Kalender"
                    help="Wähle aus, welche Kalender angezeigt werden sollen und welcher Kalender standardmäßig für neue Ereignisse verwendet wird."
                >
                    <CardContent>
                        <CalendarTable
                            calendars={calendars}
                            selectedCalendarId={selectedCalendarId}
                            visibleCalendarIds={visibleCalendarIds}
                            onCalendarSelect={setSelectedCalendarId}
                            onVisibilityToggle={handleVisibilityToggle}
                            loading={loading}
                        />
                    </CardContent>
                </Dashboard.CustomCard>
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
