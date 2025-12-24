import {
    CheckSquare2Icon,
    CircleHelpIcon,
    MinusSquareIcon,
    SquareCheckIcon,
    Trash2Icon,
    XCircleIcon,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Button } from '@/shadcn/components/ui/button';
import { Label } from '@/shadcn/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shadcn/components/ui/radio-group';
import { TableCell, TableRow } from '@/shadcn/components/ui/table';
import { Textarea } from '@/shadcn/components/ui/textarea';
import TableCellDebugID from '@/teamized/components/common/tables/TableCellDebugID';
import IconTooltip from '@/teamized/components/common/tooltips/iconTooltip';
import { ClubAttendanceEvent } from '@/teamized/interfaces/club/clubAttendanceEvent';
import {
    ClubAttendanceEventParticipation,
    ClubAttendanceMemberResponseChoice,
} from '@/teamized/interfaces/club/clubAttendanceEventParticipation';
import { ID } from '@/teamized/interfaces/common';
import { Team } from '@/teamized/interfaces/teams/team';
import * as ClubAttendanceService from '@/teamized/service/clubAttendance.service';
import { useCurrentTeamData } from '@/teamized/utils/navigation/navigationProvider';

function getResponseStatusIcon(
    response: ClubAttendanceMemberResponseChoice,
    withColor: boolean = true
) {
    switch (response) {
        case ClubAttendanceMemberResponseChoice.YES:
            return (
                <IconTooltip
                    icon={SquareCheckIcon}
                    title="Angemeldet"
                    className={withColor ? 'tw:text-success' : undefined}
                />
            );
        case ClubAttendanceMemberResponseChoice.NO:
            return (
                <IconTooltip
                    icon={XCircleIcon}
                    title="Abgemeldet"
                    className={withColor ? 'tw:text-destructive' : undefined}
                />
            );
        case ClubAttendanceMemberResponseChoice.MAYBE:
            return (
                <IconTooltip
                    icon={MinusSquareIcon}
                    title="Vielleicht"
                    className={withColor ? 'tw:text-warning' : undefined}
                />
            );
        case ClubAttendanceMemberResponseChoice.UNKNOWN:
            return <IconTooltip icon={CircleHelpIcon} title="Keine Antwort" />;
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
                    icon={CheckSquare2Icon}
                    title="Anwesend"
                    className={withColor ? 'tw:text-success' : undefined}
                />
            );
        case false:
            return (
                <IconTooltip
                    icon={XCircleIcon}
                    title="Nicht anwesend"
                    className={withColor ? 'tw:text-destructive' : undefined}
                />
            );
        case null:
            return <IconTooltip icon={CircleHelpIcon} title="Unbekannt" />;
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
}: Readonly<Props>) {
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
        <TableRow>
            <TableCell>
                {member.first_name} {member.last_name}
            </TableCell>
            <TableCell>
                {editable ? (
                    <RadioGroup
                        orientation="vertical"
                        value={
                            localParticipation.has_attended === true
                                ? 'yes'
                                : localParticipation.has_attended === false
                                  ? 'no'
                                  : 'unknown'
                        }
                        onValueChange={(value) =>
                            handleHasAttendedChange(
                                value === 'yes'
                                    ? true
                                    : value === 'no'
                                      ? false
                                      : null
                            )
                        }
                    >
                        <div className="tw:flex tw:items-center tw:gap-2">
                            <RadioGroupItem
                                value="yes"
                                id={`attended-yes-${participation.id}`}
                            />
                            <Label htmlFor={`attended-yes-${participation.id}`}>
                                Ja
                            </Label>
                        </div>
                        <div className="tw:flex tw:items-center tw:gap-2">
                            <RadioGroupItem
                                value="no"
                                id={`attended-no-${participation.id}`}
                            />
                            <Label htmlFor={`attended-no-${participation.id}`}>
                                Nein
                            </Label>
                        </div>
                    </RadioGroup>
                ) : (
                    getAttendanceStatusIcon(participation.has_attended)
                )}
            </TableCell>
            <TableCell>
                {editable ? (
                    <RadioGroup
                        orientation="vertical"
                        value={localParticipation.member_response}
                        onValueChange={(value) =>
                            handleMemberResponseChange(
                                value as ClubAttendanceMemberResponseChoice
                            )
                        }
                    >
                        <div className="tw:flex tw:items-center tw:gap-2">
                            <RadioGroupItem
                                value={ClubAttendanceMemberResponseChoice.YES}
                                id={`response-yes-${participation.id}`}
                            />
                            <Label htmlFor={`response-yes-${participation.id}`}>
                                Ja
                            </Label>
                        </div>
                        <div className="tw:flex tw:items-center tw:gap-2">
                            <RadioGroupItem
                                value={ClubAttendanceMemberResponseChoice.NO}
                                id={`response-no-${participation.id}`}
                            />
                            <Label htmlFor={`response-no-${participation.id}`}>
                                Nein
                            </Label>
                        </div>
                        <div className="tw:flex tw:items-center tw:gap-2">
                            <RadioGroupItem
                                value={ClubAttendanceMemberResponseChoice.MAYBE}
                                id={`response-maybe-${participation.id}`}
                            />
                            <Label
                                htmlFor={`response-maybe-${participation.id}`}
                            >
                                Vielleicht
                            </Label>
                        </div>
                    </RadioGroup>
                ) : (
                    getResponseStatusIcon(participation.member_response)
                )}
            </TableCell>
            <TableCell>
                {editable ? (
                    <Textarea
                        className="tw:min-h-[1.5em] tw:resize-y"
                        rows={
                            localParticipation.member_notes.split('\n')
                                .length || 1
                        }
                        defaultValue={localParticipation.member_notes}
                        onBlur={(e) => handleMemberNotesChange(e.target.value)}
                    />
                ) : (
                    <span className="tw:whitespace-pre-line">
                        {participation.member_notes}
                    </span>
                )}
            </TableCell>
            {isAdmin && (
                <TableCell>
                    {editable ? (
                        <Textarea
                            className="tw:min-h-[1.5em] tw:resize-y"
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
                        <span className="tw:whitespace-pre-line">
                            {participation.admin_notes}
                        </span>
                    )}
                </TableCell>
            )}
            {isAdmin && editable && (
                <TableCell className="tw:w-px">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        title="Teilnahme löschen"
                        onClick={handleDelete}
                        className="tw:text-destructive hover:tw:bg-destructive hover:tw:text-destructive-foreground"
                    >
                        <Trash2Icon />
                    </Button>
                </TableCell>
            )}
            <TableCellDebugID id={participation.id} />
        </TableRow>
    );
}
