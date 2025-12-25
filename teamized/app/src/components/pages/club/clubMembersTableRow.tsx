import {
    FileEditIcon,
    KeyIcon,
    MoreVerticalIcon,
    Trash2Icon,
    UserPenIcon,
    UsersRoundIcon,
} from 'lucide-react';
import React from 'react';

import { Button } from '@/shadcn/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shadcn/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/shadcn/components/ui/table';
import TableCellDebugID from '@/teamized/components/common/tables/TableCellDebugID';
import { ClubMember } from '@/teamized/interfaces/club/clubMember';
import { Team } from '@/teamized/interfaces/teams/team';
import * as ClubService from '@/teamized/service/clubs.service';
import { toast } from '@/teamized/utils/alerts';
import { useAppdataRefresh } from '@/teamized/utils/appdataProvider';
import { getAge, getDateString } from '@/teamized/utils/datetime';

interface Props {
    team: Team;
    clubMember: ClubMember;
    isAdmin: boolean;
    isOwner: boolean;
}

export default function ClubMembersTableRow({
    team,
    clubMember,
    isAdmin,
    isOwner,
}: Readonly<Props>) {
    const refreshData = useAppdataRefresh();

    const handleRemoveButtonClick = () => {
        ClubService.deleteClubMemberPopup(team, clubMember).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const handleEditButtonClick = () => {
        ClubService.editClubMemberPopup(team, clubMember).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const handlePortfolioEditButtonClick = async () => {
        await ClubService.editClubMemberPortfolioPopup(team, clubMember);
    };

    const handleGroupEditButtonClick = () => {
        ClubService.updateClubMemberGroupsPopup(team, clubMember).then(
            (result) => {
                if (result.isConfirmed) refreshData();
            }
        );
    };

    const handleCreateMagicLinkButtonClick = async () => {
        await toast
            .promise(
                ClubService.createClubMemberMagicLink(
                    team.id,
                    clubMember.id
                ).then((url) => {
                    toast.success('Magischer Link erstellt', {
                        description: 'Der Link wurde erfolgreich erstellt.',
                        action: {
                            label: 'URL kopieren',
                            onClick: () =>
                                void navigator.clipboard.writeText(url),
                        },
                        duration: 100000,
                        dismissible: false,
                    });
                }),
                {
                    loading: 'Magischer Link wird erstellt...',
                }
            )
            .unwrap();
    };

    return (
        <TableRow>
            <TableCell>
                <span>{clubMember.first_name}</span>
            </TableCell>
            <TableCell>
                <span>{clubMember.last_name}</span>
            </TableCell>
            <TableCell>
                {clubMember.birth_date === null ? null : (
                    <span>
                        {getDateString(new Date(clubMember.birth_date))} (
                        {getAge(clubMember.birth_date)})
                    </span>
                )}
            </TableCell>
            <TableCell>
                <a
                    href={'mailto:' + clubMember.email}
                    className="tw:text-sm tw:text-muted-foreground hover:tw:text-foreground tw:transition-colors"
                >
                    {clubMember.email}
                </a>
            </TableCell>

            {/* Actions dropdown */}
            <TableCell>
                {(isOwner || isAdmin) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                                <MoreVerticalIcon />
                                <span className="tw:sr-only">Mehr</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {isOwner && (
                                <DropdownMenuItem
                                    onClick={handleCreateMagicLinkButtonClick}
                                >
                                    <KeyIcon className="tw:size-4" />
                                    Magischen Link erstellen
                                </DropdownMenuItem>
                            )}
                            {isAdmin && (
                                <>
                                    {isOwner && <DropdownMenuSeparator />}
                                    <DropdownMenuItem
                                        onClick={handleEditButtonClick}
                                    >
                                        <UserPenIcon className="tw:size-4" />
                                        Mitglied bearbeiten
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handlePortfolioEditButtonClick}
                                    >
                                        <FileEditIcon className="tw:size-4" />
                                        Portfolio bearbeiten
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleGroupEditButtonClick}
                                    >
                                        <UsersRoundIcon className="tw:size-4" />
                                        Gruppen anpassen
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleRemoveButtonClick}
                                        variant="destructive"
                                    >
                                        <Trash2Icon className="tw:size-4" />
                                        Mitglied entfernen
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </TableCell>

            {/* ID */}
            <TableCellDebugID id={clubMember.id} />
        </TableRow>
    );
}
