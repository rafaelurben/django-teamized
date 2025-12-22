import React, { useEffect, useState } from 'react';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/shadcn/components/ui/select';
import { Skeleton } from '@/shadcn/components/ui/skeleton';

import { TeamCache } from '../../../interfaces/cache/teamCache';
import * as ClubService from '../../../service/clubs.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import ClubMembersTable from './clubMembersTable';

interface Props {
    teamData: TeamCache;
}

export default function ClubMemberTileContent({ teamData }: Readonly<Props>) {
    const refreshData = useAppdataRefresh();

    const [selectedValue, setSelectedValue] = useState('all');

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

    const selectedGroup = clubGroups.find((g) => g.id === selectedValue);
    const displayedMembers =
        selectedValue === 'all'
            ? clubMembers
            : clubMembers.filter((cm) =>
                  selectedGroup?.memberids.includes(cm.id)
              );

    return (
        <>
            <Select value={selectedValue} onValueChange={setSelectedValue}>
                <SelectTrigger className="tw:w-full tw:mb-4">
                    <SelectValue placeholder="Wähle eine Gruppe" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">
                        Alle Mitglieder ({clubMembers.length})
                    </SelectItem>
                    <SelectGroup>
                        <SelectLabel>Gruppen</SelectLabel>
                        {clubGroups.map((clubGroup) => (
                            <SelectItem key={clubGroup.id} value={clubGroup.id}>
                                {clubGroup.name} ({clubGroup.memberids.length})
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>

            <ClubMembersTable
                team={team}
                clubMembers={displayedMembers}
                isAdmin={isAdmin}
                isOwner={isOwner}
                group={selectedGroup}
            />
        </>
    );
}
