import {
    CheckCircle2Icon,
    CircleIcon,
    EyeIcon,
    MoreVerticalIcon,
    Trash2Icon,
} from 'lucide-react';
import React from 'react';

import { Button } from '@/shadcn/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shadcn/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/shadcn/components/ui/table';

import { Team } from '../../../interfaces/teams/team';
import { Todolist } from '../../../interfaces/todolist/todolist';
import { TodolistItem } from '../../../interfaces/todolist/todolistItem';
import * as ToDo from '../../../service/todo.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';

interface Props {
    team: Team;
    list: Todolist;
    item: TodolistItem;
}

export default function ListViewItem({ team, list, item }: Readonly<Props>) {
    const refreshData = useAppdataRefresh();

    const markDone = () => {
        ToDo.editToDoListItem(team.id, list.id, item.id, {
            done: true,
        }).then(refreshData);
    };

    const viewItem = () => {
        ToDo.viewToDoListItemPopup(team, list, item).then((result) => {
            if (result?.isConfirmed) refreshData();
        });
    };

    const deleteItem = () => {
        ToDo.deleteToDoListItemPopup(team, list, item).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    return (
        <TableRow>
            <TableCell className="tw:w-px">
                {item.done ? (
                    <Button
                        variant="success"
                        size="icon-sm"
                        disabled
                        title="Erledigt"
                    >
                        <CheckCircle2Icon />
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={markDone}
                        title="Als erledigt markieren"
                        type="button"
                    >
                        <CircleIcon />
                    </Button>
                )}
            </TableCell>
            <TableCell>
                <span>{item.name}</span>
            </TableCell>
            <TableCell className="tw:w-px">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                            <MoreVerticalIcon />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={viewItem}>
                            <EyeIcon />
                            Ansehen/Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={deleteItem}
                        >
                            <Trash2Icon />
                            Löschen
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
            <TableCell className="debug-id tw:text-muted-foreground tw:text-xs">
                {item.id}
            </TableCell>
        </TableRow>
    );
}
