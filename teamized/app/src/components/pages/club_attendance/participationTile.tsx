import React, { useEffect, useState } from 'react';

import Dashboard from '@/teamized/components/common/dashboard';
import { ClubAttendanceEvent } from '@/teamized/interfaces/club/clubAttendanceEvent';
import { ClubAttendanceEventParticipation } from '@/teamized/interfaces/club/clubAttendanceEventParticipation';
import { ID } from '@/teamized/interfaces/common';
import { Team } from '@/teamized/interfaces/teams/team';
import * as ClubAttendanceService from '@/teamized/service/clubAttendance.service';

import { ParticipationAdder } from './participationAdder';
import ParticipationTable from './participationTable';

interface Props {
    team: Team;
    selectedEvent: ClubAttendanceEvent;
    isAdmin: boolean;
    ref: React.RefObject<HTMLDivElement | null>;
}

export function ParticipationTile({
    team,
    selectedEvent,
    isAdmin,
    ref,
}: Props) {
    const [participations, setParticipations] = useState<
        ClubAttendanceEventParticipation[] | null
    >(null);

    useEffect(() => {
        ClubAttendanceService.getClubAttendanceEventParticipations(
            team.id,
            selectedEvent.id
        ).then(setParticipations);
    }, [team, selectedEvent]);

    const handleParticipationDelete = (participationId: ID) => {
        setParticipations((prev) =>
            prev ? prev.filter((p) => p.id !== participationId) : null
        );
    };

    const handleParticipationUpdate = (
        participationId: ID,
        updatedParticipation: ClubAttendanceEventParticipation
    ) => {
        setParticipations((prev) =>
            prev
                ? prev.map((p) =>
                      p.id === participationId ? updatedParticipation : p
                  )
                : null
        );
    };

    const handleParticipationsCreate = (
        participations: ClubAttendanceEventParticipation[]
    ) => {
        setParticipations((prev) =>
            prev ? [...prev, ...participations] : participations
        );
    };

    return (
        <Dashboard.CustomCard
            title={'Ereignis: ' + selectedEvent.title}
            help="Verwalte die Anwesenheit für dieses Ereignis."
            loading={participations === null}
            ref={ref}
            wrapInCardContent
        >
            {participations !== null && (
                <>
                    <ParticipationTable
                        participations={participations}
                        isAdmin={isAdmin}
                        team={team}
                        event={selectedEvent}
                        handleDelete={handleParticipationDelete}
                        handleUpdate={handleParticipationUpdate}
                    />
                    {isAdmin && (
                        <ParticipationAdder
                            team={team}
                            event={selectedEvent}
                            participations={participations}
                            handleCreate={handleParticipationsCreate}
                        />
                    )}
                </>
            )}
        </Dashboard.CustomCard>
    );
}
