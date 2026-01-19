import React, { useState } from 'react';

import { Button } from '@/shadcn/components/ui/button';
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemTitle,
} from '@/shadcn/components/ui/item';
import { ClubGroup } from '@/teamized/interfaces/club/clubGroup';
import { ClubMember } from '@/teamized/interfaces/club/clubMember';
import { ID } from '@/teamized/interfaces/common';

interface Props {
    members: ClubMember[];
    memberIdsUnavailable: ID[];
    groups: ClubGroup[];
    onCancel: () => void;
    onMembersSelected: (members: ClubMember[]) => void;
}

export function ClubMemberSelector({
    members,
    memberIdsUnavailable,
    groups,
    onCancel,
    onMembersSelected,
}: Readonly<Props>) {
    const [selectedIds, setSelectedIds] = useState<ID[]>([]);

    const selectableMembers = members.filter(
        (member) =>
            !memberIdsUnavailable.includes(member.id) &&
            !selectedIds.includes(member.id)
    );
    const selectedMembers = members.filter((member) =>
        selectedIds.includes(member.id)
    );

    const handleSelectAll = () => {
        setSelectedIds(selectableMembers.map((m) => m.id).concat(selectedIds));
    };

    const handleSelectMember = (id: ID) => {
        setSelectedIds((prev) => [...prev, id]);
    };

    const handleUnselectMember = (id: ID) => {
        setSelectedIds((prev) => prev.filter((i) => i !== id));
    };

    const handleSelectGroup = (group: ClubGroup) => {
        const groupAvailableIds = group.memberids.filter(
            (id) =>
                !memberIdsUnavailable.includes(id) && !selectedIds.includes(id)
        );
        setSelectedIds((prev) =>
            Array.from(new Set([...prev, ...groupAvailableIds]))
        );
    };

    const handleSubmit = () => {
        onMembersSelected(selectedMembers);
    };

    return (
        <div className="tw:flex tw:gap-3 tw:flex-col tw:lg:flex-row">
            {/* Left: Groups & Members */}
            <div className="tw:flex-1">
                {/* Groups */}
                <h5 className="tw:text-lg tw:font-semibold tw:mb-2">Gruppen</h5>
                <ItemGroup className="tw:gap-1">
                    {groups.map((group) => {
                        const unavailableCount = group.memberids.filter((id) =>
                            memberIdsUnavailable.includes(id)
                        ).length;
                        const selectedCount = group.memberids.filter((id) =>
                            selectedIds.includes(id)
                        ).length;
                        const groupAvailableIds = group.memberids.filter(
                            (id) =>
                                !memberIdsUnavailable.includes(id) &&
                                !selectedIds.includes(id)
                        );
                        const canAddGroup = groupAvailableIds.length > 0;
                        return (
                            <Item key={group.id} variant="outline" size="sm">
                                <ItemContent>
                                    <ItemTitle>{group.name}</ItemTitle>
                                    <ItemDescription>
                                        {group.description}
                                        <div className="tw:text-sm">
                                            {unavailableCount > 0 && (
                                                <span className="tw:mr-2">
                                                    ({unavailableCount} bereits
                                                    enthalten)
                                                </span>
                                            )}
                                            {selectedCount > 0 && (
                                                <span>
                                                    ({selectedCount} ausgewählt)
                                                </span>
                                            )}
                                        </div>
                                    </ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSelectGroup(group)}
                                        disabled={!canAddGroup}
                                    >
                                        Gruppe auswählen
                                    </Button>
                                </ItemActions>
                            </Item>
                        );
                    })}
                </ItemGroup>
                {/* Selectable members */}
                <h5 className="tw:text-lg tw:font-semibold tw:mt-3 tw:mb-2">
                    Mitglieder
                </h5>
                <Button
                    variant="outline"
                    size="sm"
                    className="tw:mb-2"
                    onClick={handleSelectAll}
                    disabled={selectableMembers.length === 0}
                >
                    Alle auswählen
                </Button>
                <ItemGroup className="tw:gap-1">
                    {selectableMembers.map((m) => (
                        <Item key={m.id} variant="outline" size="sm">
                            <ItemContent>
                                <ItemTitle>
                                    {m.first_name} {m.last_name}
                                </ItemTitle>
                            </ItemContent>
                            <ItemActions>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSelectMember(m.id)}
                                >
                                    Auswählen
                                </Button>
                            </ItemActions>
                        </Item>
                    ))}
                    {selectableMembers.length === 0 && (
                        <Item variant="muted" size="sm">
                            <ItemContent>
                                <ItemTitle>
                                    Keine weiteren Mitglieder verfügbar.
                                </ItemTitle>
                            </ItemContent>
                        </Item>
                    )}
                </ItemGroup>
            </div>
            {/* Right: Selected Members */}
            <div className="tw:flex-1">
                <h5 className="tw:text-lg tw:font-semibold tw:mb-2">
                    Ausgewählte Mitglieder
                </h5>
                <ItemGroup className="tw:gap-1">
                    {selectedMembers.map((m) => (
                        <Item key={m.id} variant="outline" size="sm">
                            <ItemContent>
                                <ItemTitle>
                                    {m.first_name} {m.last_name}
                                </ItemTitle>
                            </ItemContent>
                            <ItemActions>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUnselectMember(m.id)}
                                    className="tw:text-destructive hover:tw:bg-destructive hover:tw:text-destructive-foreground"
                                >
                                    Auswahl aufheben
                                </Button>
                            </ItemActions>
                        </Item>
                    ))}
                    {selectedMembers.length === 0 && (
                        <Item variant="muted" size="sm">
                            <ItemContent>
                                <ItemTitle>
                                    Keine Mitglieder ausgewählt.
                                </ItemTitle>
                            </ItemContent>
                        </Item>
                    )}
                </ItemGroup>
                <div className="tw:flex tw:mt-3 tw:items-start tw:gap-2 tw:flex-wrap">
                    <Button
                        variant="default"
                        onClick={handleSubmit}
                        disabled={selectedMembers.length === 0}
                    >
                        Auswahl bestätigen
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setSelectedIds([])}
                        disabled={selectedMembers.length === 0}
                    >
                        Auswahl zurücksetzen
                    </Button>
                    <Button variant="secondary" onClick={onCancel}>
                        Abbrechen
                    </Button>
                </div>
            </div>
        </div>
    );
}
