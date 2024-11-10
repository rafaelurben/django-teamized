import React, { useEffect, useState } from 'react';

import { ID } from '../../../interfaces/common';
import { Team } from '../../../interfaces/teams/team';
import * as Cache from '../../../utils/cache';
import * as Calendars from '../../../utils/calendars';
import * as Dashboard from '../../common/dashboard';
import CalendarEventDisplay from './calendarEventDisplay';
import CalendarEventPicker from './calendarEventPicker';
import CalendarInfo from './calendarInfo';
import CalendarOverview from './calendarOverview';
import CalendarSelector from './calendarSelector';

interface Props {
    team: Team;
}

export default function CalendarsPage({ team }: Props) {
    const [selectedDate, setSelectedDate] = useState(
        Calendars.roundDays(new Date())
    );
    const [selectedCalendarId, setSelectedCalendarId] = useState<ID | null>(
        null
    );
    const [selectedEventId, setSelectedEventId] = useState<ID | null>(null);

    const calendarsMap = Cache.getTeamData(team.id).calendars;
    const calendars = Object.values(calendarsMap);
    const loading = Cache.getCurrentTeamData()._state.calendars._initial;

    const isAdmin = team.member!.is_admin;

    const eventMap = Calendars.flattenCalendarEvents(calendars);

    useEffect(() => {
        ensureValidCalendarId();
        ensureValidEventId();

        if (loading) Calendars.getCalendars(team.id); // will re-render page
    });

    const handleDateSelect = (date: Date) => {
        setSelectedDate(Calendars.roundDays(date));
        // If the current selected event is not in the new selected date, deselect it
        if (selectedEventId) {
            const evt = eventMap[selectedEventId];
            if (evt && !Calendars.isDateInEvent(date, evt)) {
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

    const dayDisplay = Calendars.getDateString(selectedDate);

    const selectedCalendar =
        Cache.getCurrentTeamData().calendars[selectedCalendarId!];
    const selectedEvent = eventMap[selectedEventId!];

    return (
        <Dashboard.Page
            title="Kalender"
            subtitle="Kalender für dich und dein Team"
            loading={Cache.getCurrentTeamData()._state.calendars._initial}
        >
            <Dashboard.Column sizes={{ lg: 6 }} className="order-lg-2">
                <Dashboard.Tile
                    title="Ereignisübersicht"
                    help="Hier werden Ereignisse aus allen Kalendern des aktuellen Teams angezeigt"
                >
                    {/* Calendar overview */}
                    <CalendarOverview
                        onDateSelect={handleDateSelect}
                        selectedDate={selectedDate}
                        events={Object.values(eventMap)}
                    />
                </Dashboard.Tile>
                <Dashboard.Tile
                    title={'Ereignisse am ' + dayDisplay}
                    help="Klicke auf einen Tag in der Ereignisübersicht, um zu diesem zu wechseln."
                >
                    {/* Events from the selected day & Create new event button */}
                    <CalendarEventPicker
                        onEventSelect={setSelectedEventId}
                        selectedDate={selectedDate}
                        selectedEvent={selectedEvent}
                        selectedCalendar={selectedCalendar}
                        calendars={calendars}
                        events={Calendars.filterCalendarEventsByDate(
                            Object.values(eventMap),
                            selectedDate
                        )}
                        team={team}
                        isAdmin={isAdmin}
                    />
                </Dashboard.Tile>
            </Dashboard.Column>
            <Dashboard.Column sizes={{ lg: 6 }}>
                <Dashboard.Tile
                    title="Ausgewähltes Ereignis"
                    help="Klicke auf ein Ereignis in der Ereignisliste, um es auszuwählen/abzuwählen."
                    className="order-lg-3"
                >
                    {/* Selected event */}
                    <CalendarEventDisplay event={selectedEvent} team={team} />
                </Dashboard.Tile>
                <Dashboard.Tile
                    title="Kalenderübersicht"
                    help="Wechsle zwischen den Kalendern deines Teams oder erstelle einen neuen. Diese Auswahl hat keinen Einfluss auf die angezeigten Ereignisse."
                >
                    {/* Calendar selector/creator */}
                    <CalendarSelector
                        onCalendarSelect={setSelectedCalendarId}
                        team={team}
                        calendars={calendars}
                        selectedCalendar={selectedCalendar}
                        isAdmin={isAdmin}
                    />
                </Dashboard.Tile>
                <Dashboard.Tile
                    title="Kalenderdetails"
                    help="Sieh dir Infos zum oben ausgewählten Kalender an."
                >
                    {/* Selecting, creating and managing calendars */}
                    <CalendarInfo
                        team={team}
                        selectedCalendar={selectedCalendar}
                        onCalendarDeleted={() => setSelectedCalendarId(null)}
                        isAdmin={isAdmin}
                    />
                </Dashboard.Tile>
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
