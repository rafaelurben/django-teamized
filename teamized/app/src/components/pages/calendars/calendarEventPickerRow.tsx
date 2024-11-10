import React from 'react';

import { CalendarEvent } from '../../../interfaces/calendar/calendarEvent';
import { ID } from '../../../interfaces/common';
import * as Calendars from '../../../utils/calendars';

interface Props {
    isSelected: boolean;
    onSelect: (eventID: ID | null) => unknown;
    event: CalendarEvent;
    selectedDate: Date;
}

export default function CalendarEventPickerRow({
    isSelected,
    onSelect,
    event,
    selectedDate,
}: Props) {
    const handleSelect = () => {
        if (isSelected) {
            onSelect(null);
        } else {
            onSelect(event.id);
        }
    };

    const getStyle = () => {
        return {
            borderLeftWidth: '5px',
            borderLeftStyle: event.fullday ? 'solid' : 'dotted',
            borderLeftColor: event.calendar!.color,
            cursor: 'pointer',
            opacity: isSelected ? 0.75 : 1,
        } as React.CSSProperties;
    };

    const getDateDisplay = () => {
        const daystart = Calendars.roundDays(selectedDate);
        const dayend = Calendars.roundDays(selectedDate, 1);

        if (event.fullday) {
            const evtStart = new Date(event.dstart);
            const evtEnd = new Date(event.dend);
            const sameDayStart = Calendars.isSameDate(daystart, evtStart);
            const sameDayEnd = Calendars.isSameDate(daystart, evtEnd);

            if (sameDayStart && sameDayEnd) {
                return 'Ganztägig';
            } else {
                return (
                    'Vom ' +
                    Calendars.getDateString(evtStart) +
                    ' bis am ' +
                    Calendars.getDateString(evtEnd)
                );
            }
        } else {
            const evtStart = new Date(event.dtstart);
            const evtEnd = new Date(event.dtend);
            const sameDayStart = evtStart.getTime() >= daystart.getTime();
            const sameDayEnd = evtEnd.getTime() < dayend.getTime();

            if (sameDayStart && sameDayEnd) {
                return (
                    'Von ' +
                    Calendars.getTimeString(evtStart) +
                    ' bis ' +
                    Calendars.getTimeString(evtEnd) +
                    ' Uhr'
                );
            } else if (sameDayStart) {
                return 'Ab ' + Calendars.getTimeString(evtStart) + ' Uhr';
            } else if (sameDayEnd) {
                return 'Bis ' + Calendars.getTimeString(evtEnd) + ' Uhr';
            } else {
                return 'Ganztägig';
            }
        }
    };

    return (
        <div className="ps-2 mb-1" style={getStyle()} onClick={handleSelect}>
            <b className="d-inline-block w-100">{event.name}</b>
            <span className="d-inline-block w-100">{getDateDisplay()}</span>
            {event.location && (
                <i className="d-inline-block w-100">{event.location}</i>
            )}
        </div>
    );
}
