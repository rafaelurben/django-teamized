import { CircleIcon, PlusIcon } from 'lucide-react';
import React, { useId, useState } from 'react';

import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { Label } from '@/shadcn/components/ui/label';
import { Switch } from '@/shadcn/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from '@/shadcn/components/ui/table';
import IconTooltip from '@/teamized/components/common/tooltips/iconTooltip';

import { Team } from '../../../interfaces/teams/team';
import { Todolist } from '../../../interfaces/todolist/todolist';
import * as ToDo from '../../../service/todo.service';
import { errorAlert } from '../../../utils/alerts';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import ListViewItem from './listViewItem';

interface Props {
    team: Team;
    selectedList: Todolist | null;
    isAdmin: boolean;
}

export default function ListView({
    team,
    selectedList,
    isAdmin,
}: Readonly<Props>) {
    const refreshData = useAppdataRefresh();

    const [isCreating, setIsCreating] = useState(false);
    const [showDone, setShowDone] = useState(false);
    const showDefaultToggleId = useId();
    const newItemNameInputId = useId();

    const updateShowDone = (checked: boolean) => {
        setShowDone(checked);
    };

    const createItem = (e: React.FormEvent) => {
        e.preventDefault();
        const nameInput = document.getElementById(
            newItemNameInputId
        ) as HTMLInputElement;
        const name = nameInput.value;

        if (name === '') {
            errorAlert('Leeres Feld', 'Bitte gib einen Namen ein');
        } else {
            setIsCreating(true);
            ToDo.createToDoListItem(team.id, selectedList!.id, { name }).then(
                () => {
                    nameInput.value = '';
                    setIsCreating(false);
                    refreshData();
                }
            );
        }
    };

    if (!selectedList) {
        return (
            <p className="tw:ml-1 tw:mb-0 tw:flex tw:items-center tw:gap-1">
                <span>
                    Im ausgewählten Team ist noch keine To-do-Liste vorhanden.
                </span>
                <IconTooltip
                    title={
                        isAdmin
                            ? 'Du kannst mit den "Liste erstellen"-Knopf eine neue Liste erstellen.'
                            : 'Bitte wende dich an einen Admin dieses Teams, um eine neue Liste zu erstellen.'
                    }
                />
            </p>
        );
    }

    let items = Object.values(selectedList.items);
    if (!showDone) {
        items = items.filter((item) => !item.done);
    }

    return (
        <form onSubmit={createItem}>
            <div className="tw:flex tw:items-center tw:gap-2 tw:mb-4">
                <Switch
                    id={showDefaultToggleId}
                    checked={showDone}
                    onCheckedChange={updateShowDone}
                />
                <Label htmlFor={showDefaultToggleId}>Erledigte anzeigen</Label>
            </div>

            <Table>
                <TableBody>
                    {items.map((item) => (
                        <ListViewItem
                            key={item.id}
                            item={item}
                            list={selectedList}
                            team={team}
                        />
                    ))}

                    {/* Create item */}
                    <TableRow>
                        <TableCell className="tw:w-px">
                            <Button
                                variant="success"
                                size="icon-sm"
                                disabled
                                title="Neu"
                            >
                                <CircleIcon />
                            </Button>
                        </TableCell>
                        <TableCell>
                            <Input
                                type="text"
                                disabled={isCreating}
                                placeholder="Neues Element hinzufügen"
                                id={newItemNameInputId}
                                maxLength={50}
                            />
                        </TableCell>
                        <TableCell className="tw:w-px">
                            <Button
                                type="submit"
                                variant="success"
                                size="icon-sm"
                                disabled={isCreating}
                                title="Erstellen"
                            >
                                <PlusIcon />
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </form>
    );
}
