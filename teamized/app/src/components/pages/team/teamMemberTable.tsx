import React, { useEffect } from 'react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shadcn/components/ui/table';

import { TeamCache } from '../../../interfaces/cache/teamCache';
import * as TeamsService from '../../../service/teams.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import IconTooltip from '../../common/tooltips/iconTooltip';
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
                    <TableHead className="tw:w-[32px]">
                        <IconTooltip
                            className="tw:mx-[8px]"
                            title="Das Profilbild wird anhand der E-Mail-Adresse auf gravatar.com abgerufen"
                        />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="tw:whitespace-nowrap">
                        Benutzername &amp; E-Mail
                    </TableHead>
                    <TableHead>Rolle</TableHead>
                    <TableHead className="tw:w-[1px]"></TableHead>
                    <TableHead className="debug-id">ID</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={6}>Laden...</TableCell>
                    </TableRow>
                ) : (
                    members.map((member) => (
                        <TeamMembersTableRow
                            key={member.id}
                            member={member}
                            team={team}
                            loggedInMember={team.member!}
                        />
                    ))
                )}
            </TableBody>
        </Table>
    );
}
