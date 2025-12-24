import { AlertCircleIcon } from 'lucide-react';
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
import TableHeadDebugID from '@/teamized/components/common/tables/TableHeadDebugID';
import IconTooltip from '@/teamized/components/common/tooltips/iconTooltip';
import { ClubGroup } from '@/teamized/interfaces/club/clubGroup';
import { ClubMember } from '@/teamized/interfaces/club/clubMember';
import { Team } from '@/teamized/interfaces/teams/team';
import * as ClubService from '@/teamized/service/clubs.service';
import { useAppdataRefresh } from '@/teamized/utils/appdataProvider';

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
                            icon={AlertCircleIcon}
                            className="tw:text-yellow-600"
                        />
                    </TableHead>
                    <TableHead className="tw:w-px"></TableHead>
                    <TableHeadDebugID />
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
