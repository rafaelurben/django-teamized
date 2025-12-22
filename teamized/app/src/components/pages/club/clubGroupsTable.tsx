import React from 'react';

import { Button } from '@/shadcn/components/ui/button';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shadcn/components/ui/table';
import Tables from '@/teamized/components/common/tables';

import { ClubGroup } from '../../../interfaces/club/clubGroup';
import { Team } from '../../../interfaces/teams/team';
import * as ClubService from '../../../service/clubs.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import ClubGroupsTableRow from './clubGroupsTableRow';

interface Props {
    team: Team;
    clubGroups: ClubGroup[];
    isAdmin: boolean;
}

export default function ClubGroupsTable({
    team,
    clubGroups,
    isAdmin,
}: Readonly<Props>) {
    const refreshData = useAppdataRefresh();

    const handleCreateButtonClick = () => {
        ClubService.createClubGroupPopup(team).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Gruppenname</TableHead>
                    <TableHead>Beschreibung</TableHead>
                    <TableHead className="tw:w-[1px]"></TableHead>
                    <TableHead className="debug-id">ID</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {clubGroups.map((clubGroup) => (
                    <ClubGroupsTableRow
                        key={clubGroup.id}
                        group={clubGroup}
                        team={team}
                        isAdmin={isAdmin}
                    />
                ))}
            </TableBody>
            {isAdmin && (
                <Tables.ButtonFooter>
                    <Button variant="success" onClick={handleCreateButtonClick}>
                        Gruppe erstellen
                    </Button>
                </Tables.ButtonFooter>
            )}
        </Table>
    );
}
