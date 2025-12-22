import React from 'react';

import { Button } from '@/shadcn/components/ui/button';
import { Skeleton } from '@/shadcn/components/ui/skeleton';
import Tooltip from '@/teamized/components/common/tooltips/tooltip';

import { ID } from '../../../interfaces/common';
import { Team } from '../../../interfaces/teams/team';
import { Todolist } from '../../../interfaces/todolist/todolist';
import * as ToDo from '../../../service/todo.service';
import ListSelectorRow from './listSelectorRow';

interface Props {
    team: Team;
    lists: Todolist[];
    selectedList: Todolist | null;
    onListSelect: (listId: ID) => unknown;
    isAdmin: boolean;
    loading?: boolean;
}

export default function ListSelector({
    team,
    lists,
    selectedList,
    onListSelect,
    isAdmin,
    loading = false,
}: Readonly<Props>) {
    const createList = () => {
        ToDo.createToDoListPopup(team).then((result) => {
            if (result.isConfirmed) {
                onListSelect(result.value!.id);
            }
        });
    };

    if (loading) {
        return (
            <>
                <div className="tw:mb-2 tw:space-y-2">
                    <Skeleton className="tw:h-8 tw:w-full" />
                    <Skeleton className="tw:h-8 tw:w-full" />
                    <Skeleton className="tw:h-8 tw:w-full" />
                </div>
                <Skeleton className="tw:h-9 tw:w-full" />
            </>
        );
    }

    return (
        <>
            {lists.length > 0 && (
                <div className="tw:mb-2 tw:flex tw:flex-col">
                    {lists.map((list) => (
                        <ListSelectorRow
                            key={list.id}
                            list={list}
                            onSelect={onListSelect}
                            isSelected={selectedList?.id === list.id}
                        />
                    ))}
                </div>
            )}
            {isAdmin ? (
                <Button variant="success" onClick={createList}>
                    Liste erstellen
                </Button>
            ) : (
                <Tooltip title="Diese Aktion steht nur Admins zur Verfügung">
                    <Button variant="outline" disabled>
                        Liste erstellen
                    </Button>
                </Tooltip>
            )}
        </>
    );
}
