import React from 'react';

import CalendarSelectorRow from './calendarSelectorRow';
import Tooltip from '../../common/tooltips/tooltip';
import * as Calendars from '../../../utils/calendars';
import { Team } from '../../../interfaces/teams/team';
import { Calendar } from '../../../interfaces/calendar/calendar';
import { ID } from '../../../interfaces/common';

interface Props {
    team: Team;
    calendars: Calendar[];
    selectedCalendar: Calendar;
    onCalendarSelect: (calendarId: ID) => unknown;
    isAdmin: boolean;
}

export default function CalendarSelector({
    team,
    calendars,
    selectedCalendar,
    onCalendarSelect,
    isAdmin,
}: Props) {
    const createCalendar = () => {
        Calendars.createCalendarPopup(team).then((calendar) => {
            onCalendarSelect(calendar.id);
        });
    };

    return (
        <>
            {calendars.length > 0 && (
                <div className="mb-2">
                    {calendars.map((calendar) => (
                        <CalendarSelectorRow
                            key={calendar.id}
                            calendar={calendar}
                            onSelect={onCalendarSelect}
                            isSelected={selectedCalendar?.id === calendar.id}
                        />
                    ))}
                </div>
            )}
            {isAdmin ? (
                <button
                    className="btn btn-outline-success"
                    onClick={createCalendar}
                >
                    Kalender erstellen
                </button>
            ) : (
                <Tooltip title="Diese Aktion steht nur Admins zur Verfügung">
                    <button className="btn btn-outline-dark disabled">
                        Kalender erstellen
                    </button>
                </Tooltip>
            )}
        </>
    );
}
