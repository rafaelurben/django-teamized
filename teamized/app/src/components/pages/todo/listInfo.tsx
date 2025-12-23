import { CircleIcon, CircleQuestionMark } from 'lucide-react';
import React from 'react';

import { Button } from '@/shadcn/components/ui/button';
import { Skeleton } from '@/shadcn/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from '@/shadcn/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/shadcn/components/ui/tooltip';
import IconTooltipWithText from '@/teamized/components/common/tooltips/iconTooltipWithText';

import { Team } from '../../../interfaces/teams/team';
import { Todolist } from '../../../interfaces/todolist/todolist';
import * as ToDo from '../../../service/todo.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import Tables from '../../common/tables';
import Urlize from '../../common/utils/urlize';

interface Props {
    team: Team;
    selectedList: Todolist | null;
    onListDeleted: () => unknown;
    isAdmin: boolean;
    loading?: boolean;
}

export default function ListInfo({
    team,
    selectedList,
    onListDeleted,
    isAdmin,
    loading = false,
}: Readonly<Props>) {
    const refreshData = useAppdataRefresh();

    const editList = () => {
        ToDo.editToDoListPopup(team, selectedList!).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const deleteList = () => {
        ToDo.deleteToDoListPopup(team, selectedList!).then((result) => {
            if (result.isConfirmed) {
                onListDeleted();
                refreshData();
            }
        });
    };

    if (loading) {
        return (
            <>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell className="tw:font-medium">
                                <Skeleton className="tw:h-4 tw:w-16" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="tw:h-4 tw:w-full" />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="tw:font-medium">
                                <Skeleton className="tw:h-4 tw:w-24" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="tw:h-4 tw:w-full" />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="tw:font-medium">
                                <Skeleton className="tw:h-4 tw:w-12" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="tw:h-3 tw:w-3" />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <div className="tw:flex tw:gap-2 tw:mt-3 tw:justify-end">
                    <Skeleton className="tw:h-9 tw:w-28" />
                    <Skeleton className="tw:h-9 tw:w-20" />
                </div>
            </>
        );
    }

    if (!selectedList) {
        return (
            <IconTooltipWithText
                icon={CircleQuestionMark}
                title={
                    isAdmin
                        ? 'Du kannst mit den "Liste erstellen"-Knopf weiter oben eine neue Liste erstellen.'
                        : 'Bitte wende dich an einen Admin dieses Teams, um eine neue Liste zu erstellen.'
                }
                text="Im ausgewählten Team ist noch keine To-do-Liste vorhanden."
            />
        );
    }

    return (
        <Tables.VerticalDataTable
            items={[
                {
                    label: 'Name',
                    value: selectedList.name,
                },
                {
                    label: 'Beschreibung',
                    value: <Urlize text={selectedList.description} />,
                    limitWidth: true,
                },
                {
                    label: 'Farbe',
                    value: (
                        <CircleIcon
                            className="tw:size-3 tw:fill-current"
                            style={{ color: selectedList.color }}
                        />
                    ),
                },
                {
                    label: 'ID',
                    value: selectedList.id,
                    isDebugId: true,
                },
            ]}
        >
            <Tables.ButtonFooter>
                {isAdmin ? (
                    <>
                        <Button variant="outline" onClick={editList}>
                            Bearbeiten
                        </Button>
                        <Button variant="destructive" onClick={deleteList}>
                            Löschen
                        </Button>
                    </>
                ) : (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <Button variant="outline" disabled>
                                    Bearbeiten/Löschen
                                </Button>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            Diese Aktionen stehen nur Admins zur Verfügung
                        </TooltipContent>
                    </Tooltip>
                )}
            </Tables.ButtonFooter>
        </Tables.VerticalDataTable>
    );
}
