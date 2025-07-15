import React, { useState } from 'react';

import { ClubGroup } from '../../../interfaces/club/clubGroup';
import { ClubMember } from '../../../interfaces/club/clubMember';
import { ID } from '../../../interfaces/common';

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
}: Props) {
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
        setSelectedIds(selectableMembers.map((m) => m.id));
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
        <div className="d-flex gap-3 flex-column flex-lg-row">
            {/* Left: Groups & Members */}
            <div style={{ flex: 1 }}>
                {/* Groups */}
                <h5>Gruppen</h5>
                <ul className="list-group">
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
                            <li
                                key={group.id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <div>
                                    <strong>{group.name}</strong>
                                    <div className="small text-muted">
                                        {group.description}
                                    </div>
                                    <div className="small">
                                        {unavailableCount > 0 && (
                                            <span className="me-2">
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
                                </div>
                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => handleSelectGroup(group)}
                                    disabled={!canAddGroup}
                                >
                                    Gruppe auswählen
                                </button>
                            </li>
                        );
                    })}
                </ul>
                {/* Selectable members */}
                <h5 className="mt-3">Mitglieder</h5>
                <button
                    className="btn btn-outline-primary btn-sm mb-2"
                    onClick={handleSelectAll}
                    disabled={selectableMembers.length === 0}
                >
                    Alle auswählen
                </button>
                <ul className="list-group">
                    {selectableMembers.map((m) => (
                        <li
                            key={m.id}
                            className="list-group-item d-flex justify-content-between align-items-center"
                        >
                            <span>
                                {m.first_name} {m.last_name}
                            </span>
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleSelectMember(m.id)}
                            >
                                Auswählen
                            </button>
                        </li>
                    ))}
                    {selectableMembers.length === 0 && (
                        <li className="list-group-item text-muted">
                            Keine weiteren Mitglieder verfügbar.
                        </li>
                    )}
                </ul>
            </div>
            {/* Right: Selected Members */}
            <div style={{ flex: 1 }}>
                <h5>Ausgewählte Mitglieder</h5>
                <ul className="list-group">
                    {selectedMembers.map((m) => (
                        <li
                            key={m.id}
                            className="list-group-item d-flex justify-content-between align-items-center"
                        >
                            <span>
                                {m.first_name} {m.last_name}
                            </span>
                            <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleUnselectMember(m.id)}
                            >
                                Auswahl aufheben
                            </button>
                        </li>
                    ))}
                    {selectedMembers.length === 0 && (
                        <li className="list-group-item text-muted">
                            Keine Mitglieder ausgewählt.
                        </li>
                    )}
                </ul>
                <div className="d-flex mt-3 align-content-start gap-2 flex-wrap">
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={selectedMembers.length === 0}
                    >
                        Auswahl bestätigen
                    </button>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => setSelectedIds([])}
                        disabled={selectedMembers.length === 0}
                    >
                        Auswahl zurücksetzen
                    </button>
                    <button className="btn btn-secondary" onClick={onCancel}>
                        Abbrechen
                    </button>
                </div>
            </div>
        </div>
    );
}
