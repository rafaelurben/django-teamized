import React, { useEffect } from 'react';

import { Button } from '@/shadcn/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shadcn/components/ui/table';
import Tables from '@/teamized/components/common/tables';

import { TeamCache } from '../../../interfaces/cache/teamCache';
import * as TeamsService from '../../../service/teams.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import IconTooltip from '../../common/tooltips/iconTooltip';
import TeamInviteTableRow from './teamInviteTableRow';

interface Props {
    teamData: TeamCache;
}

export default function TeamInviteTable({ teamData }: Readonly<Props>) {
    const refreshData = useAppdataRefresh();

    const team = teamData?.team;

    const invites = Object.values(teamData.invites);
    const loading = teamData._state.invites._initial;

    useEffect(() => {
        if (loading) {
            TeamsService.getInvites(team.id).then(refreshData);
        }
    });

    const handleInviteCreateButtonClick = () => {
        TeamsService.createInvitePopup(team).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Notiz</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead className="tw:min-w-[6rem]">
                        Gültig bis
                    </TableHead>
                    <TableHead className="tw:whitespace-nowrap">
                        <div className="tw:flex tw:items-center tw:gap-1">
                            <span>Verwendungen</span>
                            <IconTooltip title="Bereits verwendet / noch verfügbar" />
                        </div>
                    </TableHead>
                    <TableHead className="tw:w-[1px]"></TableHead>
                    <TableHead className="debug-id">ID</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={6}>Laden...</TableCell>
                    </TableRow>
                ) : invites.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6}>
                            Keine Einladungen vorhanden
                        </TableCell>
                    </TableRow>
                ) : (
                    invites.map((invite) => (
                        <TeamInviteTableRow
                            key={invite.id}
                            invite={invite}
                            team={team}
                        />
                    ))
                )}
            </TableBody>
            <Tables.ButtonFooter>
                <Button
                    variant="success"
                    onClick={handleInviteCreateButtonClick}
                >
                    Einladung erstellen
                </Button>
            </Tables.ButtonFooter>
        </Table>
    );
}
