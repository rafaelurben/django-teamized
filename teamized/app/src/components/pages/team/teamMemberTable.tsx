import React, { useEffect } from 'react';

import { Skeleton } from '@/shadcn/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shadcn/components/ui/table';
import TableHeadDebugID from '@/teamized/components/common/tables/TableHeadDebugID';
import IconTooltip from '@/teamized/components/common/tooltips/iconTooltip';
import { TeamCache } from '@/teamized/interfaces/cache/teamCache';
import * as TeamsService from '@/teamized/service/teams.service';
import { useAppdataRefresh } from '@/teamized/utils/appdataProvider';

import TeamMembersTableRow from './teamMemberTableRow';

interface Props {
    teamData: TeamCache;
}

export default function TeamMemberTable({ teamData }: Readonly<Props>) {
    const refreshData = useAppdataRefresh();

    const team = teamData.team;

    const members = Object.values(teamData.members);
    const loading = teamData._state.members._initial;

    useEffect(() => {
        if (loading) {
            TeamsService.getMembers(team.id).then(refreshData);
        }
    });

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="tw:w-8">
                        <IconTooltip
                            className="tw:mx-2"
                            title="Das Profilbild wird anhand der E-Mail-Adresse auf gravatar.com abgerufen"
                        />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="tw:whitespace-nowrap">
                        Benutzername &amp; E-Mail
                    </TableHead>
                    <TableHead>Rolle</TableHead>
                    <TableHead className="tw:w-px"></TableHead>
                    <TableHeadDebugID />
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading
                    ? Array.from({ length: team?.membercount || 3 }).map(
                          (_, i) => (
                              <TableRow key={i}>
                                  {Array.from({ length: 5 }).map((_, j) => (
                                      <TableCell key={j}>
                                          <Skeleton className="tw:h-10 tw:w-full" />
                                      </TableCell>
                                  ))}
                              </TableRow>
                          )
                      )
                    : members.map((member) => (
                          <TeamMembersTableRow
                              key={member.id}
                              member={member}
                              team={team}
                              loggedInMember={team.member!}
                          />
                      ))}
            </TableBody>
        </Table>
    );
}
