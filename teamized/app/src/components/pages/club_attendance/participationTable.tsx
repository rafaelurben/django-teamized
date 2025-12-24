import { ClipboardCheckIcon, ReplyIcon, ShieldIcon } from 'lucide-react';
import React, { useState } from 'react';

import { Label } from '@/shadcn/components/ui/label';
import { Switch } from '@/shadcn/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shadcn/components/ui/table';
import TableHeadDebugID from '@/teamized/components/common/tables/TableHeadDebugID';
import IconTooltip from '@/teamized/components/common/tooltips/iconTooltip';
import { ClubAttendanceEvent } from '@/teamized/interfaces/club/clubAttendanceEvent';
import { ClubAttendanceEventParticipation } from '@/teamized/interfaces/club/clubAttendanceEventParticipation';
import { ID } from '@/teamized/interfaces/common';
import { Team } from '@/teamized/interfaces/teams/team';

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
}: Readonly<Props>) {
    const [editMode, setEditMode] = useState(false);

    return (
        <Table>
            <TableHeader>
                {isAdmin && (
                    <TableRow>
                        <TableHead colSpan={10} className="tw:text-start">
                            <div className="tw:inline-flex tw:items-center tw:gap-2">
                                <Switch
                                    id="editModeSwitch"
                                    checked={editMode}
                                    onCheckedChange={setEditMode}
                                />
                                <Label
                                    htmlFor="editModeSwitch"
                                    className="tw:cursor-pointer"
                                >
                                    Bearbeitungsmodus
                                </Label>
                            </div>
                        </TableHead>
                    </TableRow>
                )}
                <TableRow>
                    <TableHead>Mitglied</TableHead>
                    <TableHead className="tw:w-px">
                        {editMode ? (
                            <span>Anwesend?</span>
                        ) : (
                            <IconTooltip
                                title="Anwesenheitsstatus"
                                icon={ClipboardCheckIcon}
                            />
                        )}
                    </TableHead>
                    <TableHead className="tw:w-px">
                        {editMode ? (
                            <span>Angemeldet?</span>
                        ) : (
                            <IconTooltip
                                title="Anmeldestatus"
                                icon={ReplyIcon}
                            />
                        )}
                    </TableHead>
                    <TableHead>Begründung</TableHead>
                    {isAdmin && (
                        <TableHead>
                            <span className="tw:flex tw:items-center tw:gap-1 tw:whitespace-nowrap">
                                <span>Notiz</span>
                                <IconTooltip
                                    icon={ShieldIcon}
                                    title="Für Mitglied nicht sichtbar"
                                />
                            </span>
                        </TableHead>
                    )}
                    {isAdmin && editMode && <TableHead></TableHead>}
                    <TableHeadDebugID />
                </TableRow>
            </TableHeader>
            <TableBody>
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
                    <TableRow>
                        <TableCell colSpan={10} className="tw:text-center">
                            Keine Teilnehmer erfasst.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
