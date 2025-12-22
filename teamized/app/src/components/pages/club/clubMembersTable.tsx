import { AlertCircle } from 'lucide-react';
import React from 'react';

import { Button } from '@/shadcn/components/ui/button';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shadcn/components/ui/table';
import { ClubGroup } from '@/teamized/interfaces/club/clubGroup';

import { ClubMember } from '../../../interfaces/club/clubMember';
import { Team } from '../../../interfaces/teams/team';
import * as ClubService from '../../../service/clubs.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import Tables from '../../common/tables';
import IconTooltip from '../../common/tooltips/iconTooltip';
import ClubMembersTableRow from './clubMembersTableRow';

interface Props {
    team: Team;
    clubMembers: ClubMember[];
    isAdmin: boolean;
    isOwner: boolean;
    group?: ClubGroup;
}

export default function ClubMembersTable({
    team,
    clubMembers,
    isAdmin,
    isOwner,
    group,
}: Readonly<Props>) {
    const refreshData = useAppdataRefresh();

    const handleCreateButtonClick = () => {
        ClubService.createClubMemberPopup(team).then(async (result) => {
            if (result.isConfirmed) {
                if (group) {
                    // If the table is shown for a specific group, add the new member to that group
                    await ClubService.addClubMemberToGroup(
                        team.id,
                        result.value!.id,
                        group.id
                    );
                }
                refreshData();
            }
        });
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Vorname</TableHead>
                    <TableHead>Nachname</TableHead>
                    <TableHead>Geburtsdatum</TableHead>
                    <TableHead className="tw:whitespace-nowrap tw:flex tw:items-center tw:gap-1">
                        <span>E-Mail-Adresse</span>
                        <IconTooltip
                            title="Eine E-Mail-Adresse kann nicht mehrfach verwendet werden."
                            icon={AlertCircle}
                            iconClassName="tw:text-yellow-600"
                        />
                    </TableHead>
                    <TableHead className="tw:w-[1px]"></TableHead>
                    <TableHead className="debug-id">ID</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {clubMembers.map((clubMember) => (
                    <ClubMembersTableRow
                        key={clubMember.id}
                        clubMember={clubMember}
                        team={team}
                        isAdmin={isAdmin}
                        isOwner={isOwner}
                    />
                ))}
            </TableBody>
            {isAdmin && (
                <Tables.ButtonFooter>
                    <Button variant="success" onClick={handleCreateButtonClick}>
                        Mitglied erstellen
                    </Button>
                </Tables.ButtonFooter>
            )}
        </Table>
    );
}
