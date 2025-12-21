import { Users } from 'lucide-react';
import React from 'react';

import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shadcn/components/ui/table';

import { ID } from '../../../interfaces/common';
import { Team } from '../../../interfaces/teams/team';
import IconTooltip from '../../common/tooltips/iconTooltip';
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
                    <TableHead
                        className="tw:text-center"
                        style={{ width: '1px' }}
                    >
                        <IconTooltip icon={Users} title="Anzahl Mitglieder" />
                    </TableHead>
                    <TableHead>
                        <span>Name </span>
                        <span className="tw:hidden lg:tw:inline-block">
                            &amp; Beschreibung
                        </span>
                    </TableHead>
                    <TableHead>Deine Rolle</TableHead>
                    <TableHead style={{ width: '1px' }} />
                    <TableHead className="debug-id">ID</TableHead>
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
