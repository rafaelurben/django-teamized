import React from 'react';

import { ClubAttendanceEvent } from '../../../interfaces/club/clubAttendanceEvent';
import { ID } from '../../../interfaces/common';
import { Team } from '../../../interfaces/teams/team';
import * as ClubAttendanceService from '../../../service/clubAttendance.service';
import Tooltip from '../../common/tooltips/tooltip';
import EventSelectorRow from './eventSelectorRow';

interface Props {
    team: Team;
    events: ClubAttendanceEvent[];
    selectedEvent: ClubAttendanceEvent;
    onEventSelect: (eventId: ID) => unknown;
    isAdmin: boolean;
}

export default function EventSelector({
    team,
    events,
    selectedEvent,
    onEventSelect,
    isAdmin,
}: Props) {
    const createEvent = () => {
        ClubAttendanceService.createAttendanceEventPopup(team).then(
            (result) => {
                if (result.isConfirmed) {
                    onEventSelect(result.value!.id);
                }
            }
        );
    };

    return (
        <>
            {events.length > 0 && (
                <div className="mb-2">
                    {events.map((event) => (
                        <EventSelectorRow
                            key={event.id}
                            event={event}
                            onSelect={onEventSelect}
                            isSelected={selectedEvent?.id === event.id}
                        />
                    ))}
                </div>
            )}
            {isAdmin ? (
                <button
                    className="btn btn-outline-success"
                    onClick={createEvent}
                >
                    Ereignis erstellen
                </button>
            ) : (
                <Tooltip title="Diese Aktion steht nur Admins zur Verfügung">
                    <button className="btn btn-outline-dark disabled">
                        Ereignis erstellen
                    </button>
                </Tooltip>
            )}
        </>
    );
}
