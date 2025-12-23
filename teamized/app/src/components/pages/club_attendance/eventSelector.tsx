import React from 'react';

import { Button } from '@/shadcn/components/ui/button';
import { Skeleton } from '@/shadcn/components/ui/skeleton';

import { ClubAttendanceEvent } from '../../../interfaces/club/clubAttendanceEvent';
import { ID } from '../../../interfaces/common';
import { Team } from '../../../interfaces/teams/team';
import * as ClubAttendanceService from '../../../service/clubAttendance.service';
import CustomTooltip from '../../common/tooltips/customTooltip';
import EventSelectorRow from './eventSelectorRow';

interface Props {
    team: Team;
    events: ClubAttendanceEvent[];
    selectedEvent: ClubAttendanceEvent;
    onEventSelect: (eventId: ID) => unknown;
    isAdmin: boolean;
    loading?: boolean;
}

export default function EventSelector({
    team,
    events,
    selectedEvent,
    onEventSelect,
    isAdmin,
    loading = false,
}: Readonly<Props>) {
    const createEvent = () => {
        ClubAttendanceService.createAttendanceEventPopup(team).then(
            (result) => {
                if (result.isConfirmed) {
                    onEventSelect(result.value!.id);
                }
            }
        );
    };

    if (loading) {
        return (
            <>
                <div className="tw:mb-2 tw:space-y-2">
                    <Skeleton className="tw:h-14 tw:w-full" />
                    <Skeleton className="tw:h-14 tw:w-full" />
                    <Skeleton className="tw:h-14 tw:w-full" />
                </div>
                <Skeleton className="tw:h-9 tw:w-full" />
            </>
        );
    }

    return (
        <>
            {events.length > 0 && (
                <div className="tw:mb-2 tw:flex tw:flex-col">
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
                <Button variant="success" onClick={createEvent}>
                    Ereignis erstellen
                </Button>
            ) : (
                <CustomTooltip title="Diese Aktion steht nur Admins zur Verfügung">
                    <Button variant="outline" disabled>
                        Ereignis erstellen
                    </Button>
                </CustomTooltip>
            )}
        </>
    );
}
