import { UsersIcon } from 'lucide-react';
import React from 'react';

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
import { ID } from '@/teamized/interfaces/common';
import { Team } from '@/teamized/interfaces/teams/team';

import TeamTableRow from './teamTableRow';

interface Props {
    teams: Team[];
    selectedTeamId: ID;
    loading: boolean;
}

export default function TeamTable({
    teams,
    selectedTeamId,
    loading,
}: Readonly<Props>) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="tw:text-center tw:w-px">
                        <IconTooltip
                            icon={UsersIcon}
                            title="Anzahl Mitglieder"
                        />
                    </TableHead>
                    <TableHead>
                        <span>Name </span>
                        <span className="tw:hidden lg:tw:inline-block">
                            &amp; Beschreibung
                        </span>
                    </TableHead>
                    <TableHead>Deine Rolle</TableHead>
                    <TableHead className="tw:w-px" />
                    <TableHeadDebugID />
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading
                    ? Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i}>
                              <TableCell>
                                  <Skeleton className="tw:h-6 tw:w-6" />
                              </TableCell>
                              <TableCell>
                                  <Skeleton className="tw:h-6 tw:w-full" />
                              </TableCell>
                              <TableCell>
                                  <Skeleton className="tw:h-6 tw:w-full" />
                              </TableCell>
                              <TableCell>
                                  <Skeleton className="tw:h-6 tw:w-6" />
                              </TableCell>
                          </TableRow>
                      ))
                    : teams.map((team) => (
                          <TeamTableRow
                              key={team.id}
                              team={team}
                              isSelected={team.id === selectedTeamId}
                          />
                      ))}
            </TableBody>
        </Table>
    );
}
