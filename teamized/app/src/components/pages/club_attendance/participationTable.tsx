import React, { useState } from 'react';

import { ClubAttendanceEvent } from '../../../interfaces/club/clubAttendanceEvent';
import { ClubAttendanceEventParticipation } from '../../../interfaces/club/clubAttendanceEventParticipation';
import { ID } from '../../../interfaces/common';
import { Team } from '../../../interfaces/teams/team';
import Tables from '../../common/tables';
import IconTooltip from '../../common/tooltips/iconTooltip';
import ParticipationTableRow from './participationTableRow';

interface Props {
    participations: ClubAttendanceEventParticipation[];
    isAdmin: boolean;
    team: Team;
    event: ClubAttendanceEvent;
    handleDelete: (participationId: ID) => void;
    handleUpdate: (
        participationId: ID,
        updatedParticipation: ClubAttendanceEventParticipation
    ) => void;
}

export default function ParticipationTable({
    participations,
    isAdmin,
    team,
    event,
    handleDelete,
    handleUpdate,
}: Props) {
    const [editMode, setEditMode] = useState(false);

    return (
        <Tables.SimpleTable>
            <thead>
                {isAdmin && (
                    <tr>
                        <th colSpan={10} className="text-start">
                            <div className="form-check form-switch d-inline-flex align-items-center">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="editModeSwitch"
                                    checked={editMode}
                                    onChange={() => setEditMode((v) => !v)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <label
                                    className="form-check-label ms-2"
                                    htmlFor="editModeSwitch"
                                >
                                    Bearbeitungsmodus
                                </label>
                            </div>
                        </th>
                    </tr>
                )}
                <tr>
                    <th>Mitglied</th>
                    <th style={{ width: '1px' }}>
                        {editMode ? (
                            <span>Anwesend?</span>
                        ) : (
                            <IconTooltip
                                title="Anwesenheitsstatus"
                                icon="fa-solid fa-clipboard-check"
                            />
                        )}
                    </th>
                    <th style={{ width: '1px' }}>
                        {editMode ? (
                            <span>Angemeldet?</span>
                        ) : (
                            <IconTooltip
                                title="Anmeldestatus"
                                icon="fa-solid fa-reply"
                            />
                        )}
                    </th>
                    <th>Begründung</th>
                    {isAdmin && (
                        <Tables.Th noWrapFlex={true}>
                            <span>Notiz</span>
                            <IconTooltip
                                icon="fa-solid fa-shield"
                                title="Für Mitglied nicht sichtbar"
                            />
                        </Tables.Th>
                    )}
                    {isAdmin && editMode && <th></th>}
                    <th className="debug-id">ID</th>
                </tr>
            </thead>
            <tbody>
                {participations.length > 0 ? (
                    participations.map((participation) => (
                        <ParticipationTableRow
                            key={participation.id}
                            participation={participation}
                            isAdmin={isAdmin}
                            team={team}
                            event={event}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                            editable={editMode}
                        />
                    ))
                ) : (
                    <tr>
                        <td colSpan={10} className="text-center">
                            Keine Teilnehmer erfasst.
                        </td>
                    </tr>
                )}
            </tbody>
        </Tables.SimpleTable>
    );
}
