import { Users } from 'lucide-react';
import React from 'react';

import {
    Table,
    TableBody,
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
}

export default function TeamTable({ teams, selectedTeamId }: Readonly<Props>) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="tw:text-center tw:w-px">
                        <IconTooltip icon={Users} title="Anzahl Mitglieder" />
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
                {teams.map((team) => (
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
