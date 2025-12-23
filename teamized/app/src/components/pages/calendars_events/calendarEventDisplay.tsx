import { CircleIcon } from 'lucide-react';
import React from 'react';

import { Button } from '@/shadcn/components/ui/button';

import { Calendar } from '../../../interfaces/calendar/calendar';
import { CalendarEvent } from '../../../interfaces/calendar/calendarEvent';
import { Team } from '../../../interfaces/teams/team';
import * as CalendarService from '../../../service/calendars.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import Tables from '../../common/tables';
import Urlize from '../../common/utils/urlize';

interface Props {
    team: Team;
    event: CalendarEvent;
    calendars: Calendar[];
}

export default function CalendarEventDisplay({
    team,
    event,
    calendars,
}: Readonly<Props>) {
    const refreshData = useAppdataRefresh();

    const editEvent = () => {
        CalendarService.editEventPopup(
            team,
            event.calendar!,
            calendars,
            event
        ).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const cloneEvent = () => {
        CalendarService.editEventPopup(
            team,
            event.calendar!,
            calendars,
            event,
            true
        ).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const deleteEvent = () => {
        CalendarService.deleteEventPopup(team, event.calendar!, event).then(
            (result) => {
                if (result.isConfirmed) refreshData();
            }
        );
    };

    if (!event) {
        return (
            <span className="tw:text-muted-foreground">
                Kein Ereignis ausgewählt.
            </span>
        );
    }

    let eventStartDisplay: string;
    let eventEndDisplay: string;

    if (event.fullday) {
        eventStartDisplay = CalendarService.getDateString(
            new Date(event.dstart)
        );
        eventEndDisplay = CalendarService.getDateString(new Date(event.dend));
    } else {
        eventStartDisplay = CalendarService.getDateTimeString(
            new Date(event.dtstart)
        );
        eventEndDisplay = CalendarService.getDateTimeString(
            new Date(event.dtend)
        );
    }

    return (
        <Tables.VerticalDataTable
            items={[
                { label: 'Name', value: event.name },
                {
                    label: 'Beschreibung',
                    value: <Urlize text={event.description} />,
                    hide: !event.description,
                    limitWidth: true,
                },
                {
                    label: 'Ort',
                    value: event.location,
                    hide: !event.location,
                },
                {
                    label: 'Start',
                    value: eventStartDisplay,
                },
                {
                    label: 'Ende',
                    value: eventEndDisplay,
                },
                {
                    label: 'Kalender',
                    value: (
                        <span className="tw:flex tw:items-center tw:gap-2">
                            <CircleIcon
                                className="tw:size-3 tw:fill-current"
                                style={{ color: event.calendar?.color }}
                            />
                            {event.calendar?.name}
                        </span>
                    ),
                },
                {
                    label: 'ID',
                    value: event.id,
                    isDebugId: true,
                },
            ]}
        >
            <Tables.ButtonFooter>
                <Button variant="outline" onClick={editEvent}>
                    Bearbeiten
                </Button>
                <Button variant="outline" onClick={cloneEvent}>
                    Duplizieren
                </Button>
                <Button variant="destructive" onClick={deleteEvent}>
                    Löschen
                </Button>
            </Tables.ButtonFooter>
        </Tables.VerticalDataTable>
    );
}
