import React, { useEffect, useState } from 'react';

import { Skeleton } from '@/shadcn/components/ui/skeleton';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/shadcn/components/ui/tabs';

import { TeamCache } from '../../../interfaces/cache/teamCache';
import * as ClubService from '../../../service/clubs.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import IconTooltip from '../../common/tooltips/iconTooltip';
import ClubMembersTable from './clubMembersTable';

interface Props {
    teamData: TeamCache;
}

export default function ClubMemberTileContent({ teamData }: Readonly<Props>) {
    const refreshData = useAppdataRefresh();

    const [selectedTab, setSelectedTab] = useState('all');

    const team = teamData.team;
    const isOwner = teamData.team.member!.is_owner;
    const isAdmin = teamData.team.member!.is_admin;

    const clubMembers = Object.values(teamData.club_members);
    const clubGroups = Object.values(teamData.club_groups);
    const clubMembersLoading = teamData._state.club_members._initial;
    const clubGroupsLoading = teamData._state.club_groups._initial;

    useEffect(() => {
        if (clubMembersLoading) {
            ClubService.getClubMembers(team.id).then(refreshData);
        }
        if (clubGroupsLoading) {
            ClubService.getClubGroups(team.id).then(refreshData);
        }
    });

    if (clubMembersLoading || clubGroupsLoading) {
        return <Skeleton className="tw:w-full tw:h-48" />;
    }

    return (
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="tw:flex-wrap tw:gap-2 tw:h-auto">
                <TabsTrigger value="all">
                    Alle ({clubMembers.length})
                </TabsTrigger>
                {clubGroups.map((clubGroup) => (
                    <TabsTrigger key={clubGroup.id} value={clubGroup.id}>
                        {clubGroup.name} ({clubGroup.memberids.length})
                        {clubGroup.description && (
                            <IconTooltip title={clubGroup.description} />
                        )}
                    </TabsTrigger>
                ))}
            </TabsList>

            <TabsContent value="all">
                <ClubMembersTable
                    team={team}
                    clubMembers={clubMembers}
                    isAdmin={isAdmin}
                    isOwner={isOwner}
                />
            </TabsContent>

            {clubGroups.map((clubGroup) => (
                <TabsContent key={clubGroup.id} value={clubGroup.id}>
                    <ClubMembersTable
                        team={team}
                        clubMembers={clubMembers.filter((cm) =>
                            clubGroup.memberids.includes(cm.id)
                        )}
                        isAdmin={isAdmin}
                        isOwner={isOwner}
                        group={clubGroup}
                    />
                </TabsContent>
            ))}
        </Tabs>
    );
}
