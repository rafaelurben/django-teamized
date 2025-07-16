import React, { useEffect, useState } from 'react';

import { ClubAttendanceEvent } from '../../../interfaces/club/clubAttendanceEvent';
import {
    ClubAttendanceEventParticipation,
    ClubAttendanceMemberResponseChoice,
} from '../../../interfaces/club/clubAttendanceEventParticipation';
import { ID } from '../../../interfaces/common';
import { Team } from '../../../interfaces/teams/team';
import * as ClubAttendanceService from '../../../service/clubAttendance.service';
import { useCurrentTeamData } from '../../../utils/navigation/navigationProvider';
import IconTooltip from '../../common/tooltips/iconTooltip';

function getResponseStatusIcon(
    response: ClubAttendanceMemberResponseChoice,
    withColor: boolean = true
) {
    switch (response) {
        case ClubAttendanceMemberResponseChoice.YES:
            return (
                <IconTooltip
                    icon="fa-regular fa-square-check"
                    title="Angemeldet"
                    className={withColor ? 'text-success' : undefined}
                />
            );
        case ClubAttendanceMemberResponseChoice.NO:
            return (
                <IconTooltip
                    icon="fa-regular fa-circle-xmark"
                    title="Abgemeldet"
                    className={withColor ? 'text-danger' : undefined}
                />
            );
        case ClubAttendanceMemberResponseChoice.MAYBE:
            return (
                <IconTooltip
                    icon="fa-regular fa-square-minus"
                    title="Vielleicht"
                    className={withColor ? 'text-warning' : undefined}
                />
            );
        case ClubAttendanceMemberResponseChoice.UNKNOWN:
            return (
                <IconTooltip
                    icon="fa-regular fa-circle-question"
                    title="Keine Antwort"
                />
            );
    }
}

function getAttendanceStatusIcon(
    attended: boolean | null,
    withColor: boolean = true
) {
    switch (attended) {
        case true:
            return (
                <IconTooltip
                    icon="fa-solid fa-square-check"
                    title="Anwesend"
                    className={withColor ? 'text-success' : undefined}
                />
            );
        case false:
            return (
                <IconTooltip
                    icon="fa-solid fa-circle-xmark"
                    title="Nicht anwesend"
                    className={withColor ? 'text-danger' : undefined}
                />
            );
        case null:
            return (
                <IconTooltip
                    icon="fa-solid fa-circle-question"
                    title="Unbekannt"
                />
            );
    }
}

interface Props {
    participation: ClubAttendanceEventParticipation;
    isAdmin: boolean;
    team: Team;
    event: ClubAttendanceEvent;
    onDelete: (participationId: ID) => void;
    onUpdate: (
        participationId: ID,
        updatedParticipation: ClubAttendanceEventParticipation
    ) => void;
    editable: boolean;
}

export default function ParticipationTableRow({
    participation,
    isAdmin,
    team,
    event,
    onDelete,
    onUpdate,
    editable,
}: Props) {
    const teamData = useCurrentTeamData();
    const member = teamData.club_members[participation.member_id];

    const [localParticipation, setLocalParticipation] = useState(participation);

    useEffect(() => {
        setLocalParticipation(participation);
    }, [participation]);

    const updateParticipation = (
        changes: Partial<ClubAttendanceEventParticipation>
    ) => {
        const updated = { ...localParticipation, ...changes };
        setLocalParticipation(updated);
        onUpdate(participation.id, updated);
        ClubAttendanceService.updateClubAttendanceEventParticipation(
            team.id,
            event.id,
            participation.id,
            changes
        );
    };

    const handleMemberResponseChange = (
        value: ClubAttendanceMemberResponseChoice
    ) => {
        updateParticipation({ member_response: value });
    };
    const handleMemberNotesChange = (value: string) => {
        updateParticipation({ member_notes: value });
    };
    const handleHasAttendedChange = (value: boolean | null) => {
        updateParticipation({ has_attended: value });
    };
    const handleAdminNotesChange = (value: string) => {
        updateParticipation({ admin_notes: value });
    };

    const handleDelete = async () => {
        await ClubAttendanceService.deleteClubAttendanceEventParticipationPopup(
            team,
            event,
            participation
        ).then((result) => {
            if (result.isConfirmed) onDelete(participation.id);
        });
    };

    return (
        <tr>
            <td>
                {member.first_name} {member.last_name}
            </td>
            <td>
                {editable ? (
                    <div className="d-flex gap-1 flex-column flex-xl-row">
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name={`attended-${participation.id}`}
                                value="yes"
                                checked={
                                    localParticipation.has_attended === true
                                }
                                onChange={() => handleHasAttendedChange(true)}
                            />
                            <label className="form-check-label">Ja</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name={`attended-${participation.id}`}
                                value="no"
                                checked={
                                    localParticipation.has_attended === false
                                }
                                onChange={() => handleHasAttendedChange(false)}
                            />
                            <label className="form-check-label">Nein</label>
                        </div>
                    </div>
                ) : (
                    getAttendanceStatusIcon(participation.has_attended)
                )}
            </td>
            <td>
                {editable ? (
                    <div className="d-flex gap-1 flex-column flex-xl-row">
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name={`response-${participation.id}`}
                                value="YES"
                                checked={
                                    localParticipation.member_response ===
                                    ClubAttendanceMemberResponseChoice.YES
                                }
                                onChange={() =>
                                    handleMemberResponseChange(
                                        ClubAttendanceMemberResponseChoice.YES
                                    )
                                }
                            />
                            <label className="form-check-label">Ja</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name={`response-${participation.id}`}
                                value="NO"
                                checked={
                                    localParticipation.member_response ===
                                    ClubAttendanceMemberResponseChoice.NO
                                }
                                onChange={() =>
                                    handleMemberResponseChange(
                                        ClubAttendanceMemberResponseChoice.NO
                                    )
                                }
                            />
                            <label className="form-check-label">Nein</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name={`response-${participation.id}`}
                                value="MAYBE"
                                checked={
                                    localParticipation.member_response ===
                                    ClubAttendanceMemberResponseChoice.MAYBE
                                }
                                onChange={() =>
                                    handleMemberResponseChange(
                                        ClubAttendanceMemberResponseChoice.MAYBE
                                    )
                                }
                            />
                            <label className="form-check-label">
                                Vielleicht
                            </label>
                        </div>
                    </div>
                ) : (
                    getResponseStatusIcon(participation.member_response)
                )}
            </td>
            <td>
                {editable ? (
                    <textarea
                        className="form-control form-control-sm"
                        style={{ minHeight: '1.5em', resize: 'vertical' }}
                        rows={
                            localParticipation.member_notes.split('\n')
                                .length || 1
                        }
                        defaultValue={localParticipation.member_notes}
                        onBlur={(e) => handleMemberNotesChange(e.target.value)}
                    />
                ) : (
                    <span style={{ whiteSpace: 'pre-line' }}>
                        {participation.member_notes}
                    </span>
                )}
            </td>
            {isAdmin && (
                <td>
                    {editable ? (
                        <textarea
                            className="form-control form-control-sm"
                            style={{ minHeight: '1.5em', resize: 'vertical' }}
                            rows={
                                localParticipation.admin_notes.split('\n')
                                    .length || 1
                            }
                            defaultValue={localParticipation.admin_notes}
                            onBlur={(e) =>
                                handleAdminNotesChange(e.target.value)
                            }
                        />
                    ) : (
                        <span style={{ whiteSpace: 'pre-line' }}>
                            {participation.admin_notes}
                        </span>
                    )}
                </td>
            )}
            {isAdmin && editable && (
                <td style={{ width: '1px' }}>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        title="Teilnahme löschen"
                        onClick={handleDelete}
                    >
                        <i className="fa-solid fa-trash fa-sm" />
                    </button>
                </td>
            )}
            <td className="debug-id">{participation.id}</td>
        </tr>
    );
}
