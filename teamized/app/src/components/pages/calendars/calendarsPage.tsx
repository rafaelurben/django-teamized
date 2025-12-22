import React, { useEffect, useState } from 'react';

import { CardContent } from '@/shadcn/components/ui/card';

import { ID } from '../../../interfaces/common';
import * as CalendarService from '../../../service/calendars.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import { useCurrentTeamData } from '../../../utils/navigation/navigationProvider';
import Dashboard from '../../common/dashboard';
import CalendarEventDisplay from './calendarEventDisplay';
import CalendarEventPicker from './calendarEventPicker';
import CalendarInfo from './calendarInfo';
import CalendarOverview from './calendarOverview';
import CalendarSelector from './calendarSelector';

export default function CalendarsPage() {
    const refreshData = useAppdataRefresh();

    const [selectedDate, setSelectedDate] = useState(
        CalendarService.roundDays(new Date())
    );
    const [selectedCalendarId, setSelectedCalendarId] = useState<ID | null>(
        null
    );
    const [selectedEventId, setSelectedEventId] = useState<ID | null>(null);

    const teamData = useCurrentTeamData();
    const team = teamData?.team;

    const calendarsMap = teamData.calendars;
    const calendars = Object.values(calendarsMap);
    const loading = teamData._state.calendars._initial;

    const isAdmin = team.member!.is_admin;

    const eventMap = CalendarService.flattenCalendarEvents(calendars);

    useEffect(() => {
        ensureValidCalendarId();
        ensureValidEventId();

        if (loading) {
            CalendarService.getCalendars(team.id).then(refreshData);
        }
    });

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
        <Dashboard.Page loading={loading}>
            <Dashboard.Column sizes={{ lg: 6 }} className="tw:lg:order-2">
                <Dashboard.CustomCard
                    title="Ereignisübersicht"
                    help="Hier werden Ereignisse aus allen Kalendern des aktuellen Teams angezeigt"
                >
                    <CardContent>
                        <CalendarOverview
                            onDateSelect={handleDateSelect}
                            selectedDate={selectedDate}
                            events={Object.values(eventMap)}
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
                                Object.values(eventMap),
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
                    title="Kalenderübersicht"
                    help="Wechsle zwischen den Kalendern deines Teams oder erstelle einen neuen. Diese Auswahl hat keinen Einfluss auf die angezeigten Ereignisse."
                >
                    <CardContent>
                        <CalendarSelector
                            onCalendarSelect={setSelectedCalendarId}
                            team={team}
                            calendars={calendars}
                            selectedCalendar={selectedCalendar}
                            isAdmin={isAdmin}
                            loading={loading}
                        />
                    </CardContent>
                </Dashboard.CustomCard>
                <Dashboard.CustomCard
                    title="Kalenderdetails"
                    help="Sieh dir Infos zum oben ausgewählten Kalender an."
                >
                    <CardContent>
                        <CalendarInfo
                            team={team}
                            selectedCalendar={selectedCalendar}
                            onCalendarDeleted={() =>
                                setSelectedCalendarId(null)
                            }
                            isAdmin={isAdmin}
                            loading={loading}
                        />
                    </CardContent>
                </Dashboard.CustomCard>
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
