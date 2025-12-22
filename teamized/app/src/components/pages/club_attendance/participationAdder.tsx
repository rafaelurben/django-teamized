import React, { useState } from 'react';

import { Button } from '@/shadcn/components/ui/button';

import { ClubAttendanceEvent } from '../../../interfaces/club/clubAttendanceEvent';
import { ClubAttendanceEventParticipation } from '../../../interfaces/club/clubAttendanceEventParticipation';
import { Team } from '../../../interfaces/teams/team';
import * as ClubAttendanceService from '../../../service/clubAttendance.service';
import { useCurrentTeamData } from '../../../utils/navigation/navigationProvider';
import { ClubMemberSelector } from './clubMemberSelector';

interface Props {
    team: Team;
    event: ClubAttendanceEvent;
    participations: ClubAttendanceEventParticipation[];
    handleCreate: (participations: ClubAttendanceEventParticipation[]) => void;
}

export function ParticipationAdder({
    team,
    event,
    participations,
    handleCreate,
}: Readonly<Props>) {
    const teamData = useCurrentTeamData();
    const [formVisible, setFormVisible] = useState(false);
    const memberIdsUnavailable = participations.map((p) => p.member_id);

    if (formVisible) {
        return (
            <div className="tw:p-1 md:tw:p-2 lg:tw:p-3">
                <ClubMemberSelector
                    members={Object.values(teamData.club_members)}
                    memberIdsUnavailable={memberIdsUnavailable}
                    groups={Object.values(teamData.club_groups)}
                    onMembersSelected={(members) => {
                        ClubAttendanceService.bulkCreateClubAttendanceEventParticipations(
                            team.id,
                            event.id,
                            members.map((member) => member.id)
                        ).then((newParticipations) => {
                            handleCreate(newParticipations);
                        });
                        setFormVisible(false);
                    }}
                    onCancel={() => {
                        setFormVisible(false);
                    }}
                />
            </div>
        );
    } else {
        return (
            <div className="tw:flex tw:justify-end tw:mt-2">
                <Button variant="success" onClick={() => setFormVisible(true)}>
                    Mitglieder hinzufügen
                </Button>
            </div>
        );
    }
}
