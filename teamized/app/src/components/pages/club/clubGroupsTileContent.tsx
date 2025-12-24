import React, { useEffect } from 'react';

import { Skeleton } from '@/shadcn/components/ui/skeleton';
import { TeamCache } from '@/teamized/interfaces/cache/teamCache';
import * as ClubService from '@/teamized/service/clubs.service';
import { useAppdataRefresh } from '@/teamized/utils/appdataProvider';

import ClubGroupsTable from './clubGroupsTable';

interface Props {
    teamData: TeamCache;
}

export default function ClubGroupsTileContent({ teamData }: Readonly<Props>) {
    const refreshData = useAppdataRefresh();

    const team = teamData.team;
    const isAdmin = teamData.team.member!.is_admin;

    const clubGroups = Object.values(teamData.club_groups);
    const clubGroupsLoading = teamData._state.club_groups._initial;

    useEffect(() => {
        if (clubGroupsLoading) {
            ClubService.getClubGroups(team.id).then(refreshData);
        }
    });

    if (clubGroupsLoading) {
        return <Skeleton className="tw:w-full tw:h-14" />;
    }

    return (
        <ClubGroupsTable
            team={team}
            clubGroups={clubGroups}
            isAdmin={isAdmin}
        />
    );
}
