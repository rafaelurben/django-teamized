import React, { useState } from 'react';

import { ClubPresenceEvent } from '../../../interfaces/club/clubPresenceEvent';
import { ClubPresenceEventParticipation } from '../../../interfaces/club/clubPresenceEventParticipation';
import { Team } from '../../../interfaces/teams/team';
import * as ClubPresenceService from '../../../service/clubPresence.service';
import { useCurrentTeamData } from '../../../utils/navigation/navigationProvider';
import { ClubMemberSelector } from './clubMemberSelector';

interface Props {
    team: Team;
    event: ClubPresenceEvent;
    participations: ClubPresenceEventParticipation[];
    handleCreate: (participations: ClubPresenceEventParticipation[]) => void;
}

export function ParticipationAdder({
    team,
    event,
    participations,
    handleCreate,
}: Props) {
    const teamData = useCurrentTeamData();
    const [formVisible, setFormVisible] = useState(false);
    const memberIdsUnavailable = participations.map((p) => p.member_id);

    if (formVisible) {
        return (
            <div className="p-1 p-md-2 p-lg-3">
                <ClubMemberSelector
                    members={Object.values(teamData.club_members)}
                    memberIdsUnavailable={memberIdsUnavailable}
                    groups={Object.values(teamData.club_groups)}
                    onMembersSelected={(members) => {
                        ClubPresenceService.bulkCreateClubPresenceEventParticipations(
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
            <div className="d-flex justify-content-end mt-2">
                <button
                    className="btn btn-outline-success"
                    onClick={() => setFormVisible(true)}
                >
                    Mitglieder hinzufügen
                </button>
            </div>
        );
    }
}
