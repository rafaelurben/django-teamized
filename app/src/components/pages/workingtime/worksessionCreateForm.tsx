'use client';

import * as React from 'react';
import { useState } from 'react';

import { Button } from '@/shadcn/components/ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/shadcn/components/ui/field';
import { Input } from '@/shadcn/components/ui/input';
import { Spinner } from '@/shadcn/components/ui/spinner';
import { Textarea } from '@/shadcn/components/ui/textarea';
import {
    DateTimeRangePicker,
    getLastFullHourTimes,
} from '@/teamized/components/common/utils/datetime/dateTimeRangePicker';
import { Team } from '@/teamized/interfaces/teams/team';
import { Worksession } from '@/teamized/interfaces/workingtime/worksession';
import * as WorkingtimeService from '@/teamized/service/workingtime.service';
import { isoFormat } from '@/teamized/utils/datetime';

interface Props {
    team: Team;
    onSuccess?: (session: Worksession) => void;
    onCancel?: () => void;
}

export function WorksessionCreateForm({
    team,
    onSuccess,
    onCancel,
}: Readonly<Props>) {
    const defaultTimes = React.useMemo(() => getLastFullHourTimes(), []);

    const [startDate, setStartDate] = useState<Date>(defaultTimes.startDate);
    const [endDate, setEndDate] = useState<Date>(defaultTimes.endDate);
    const [note, setNote] = useState('');
    const [unitCount, setUnitCount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleDateTimeChange = (newStart: Date, newEnd: Date) => {
        setStartDate(newStart);
        setEndDate(newEnd);
        if (errorMessage) {
            setErrorMessage(null);
        }
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        if (endDate.getTime() <= startDate.getTime()) {
            setErrorMessage('Die Endzeit muss nach der Startzeit liegen!');
            return;
        }

        let parsedUnitCount: number | null = null;
        if (unitCount.trim() !== '') {
            const count = Number(unitCount);
            if (Number.isNaN(count) || count < 0) {
                setErrorMessage(
                    'Einheiten müssen eine gültige positive Zahl sein!'
                );
                return;
            }
            parsedUnitCount = count;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const createdSession = await WorkingtimeService.createWorkSession(
                team.id,
                {
                    note,
                    unit_count: parsedUnitCount,
                    time_start: isoFormat(startDate),
                    time_end: isoFormat(endDate),
                }
            );
            onSuccess?.(createdSession);
        } catch (err) {
            const msg =
                err instanceof Error
                    ? err.message
                    : 'Fehler beim Erstellen der Sitzung';
            setErrorMessage(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="tw:flex tw:flex-col tw:gap-4">
            <FieldGroup className="tw:gap-3">
                <DateTimeRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onChange={handleDateTimeChange}
                    disabled={isSubmitting}
                />

                <Field>
                    <FieldLabel htmlFor="worksession-unit-count">
                        Einheiten (optional)
                    </FieldLabel>
                    <Input
                        id="worksession-unit-count"
                        type="number"
                        min={0}
                        step="any"
                        placeholder="z. B. 1"
                        value={unitCount}
                        onChange={(e) => setUnitCount(e.target.value)}
                        disabled={isSubmitting}
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="worksession-note">
                        Notiz (optional)
                    </FieldLabel>
                    <Textarea
                        id="worksession-note"
                        placeholder="Notiz zur Sitzung..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        disabled={isSubmitting}
                        rows={3}
                    />
                </Field>
            </FieldGroup>

            {errorMessage && <FieldError>{errorMessage}</FieldError>}

            <div className="tw:flex tw:gap-2 tw:pt-2">
                <Button
                    type="submit"
                    variant="success"
                    className="tw:flex-1"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Spinner className="tw:size-4" />
                            <span>Wird gespeichert...</span>
                        </>
                    ) : (
                        <span>Erstellen</span>
                    )}
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Abbrechen
                    </Button>
                )}
            </div>
        </form>
    );
}
