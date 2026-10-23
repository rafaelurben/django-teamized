'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';

import { Field, FieldLabel } from '@/shadcn/components/ui/field';
import { Input } from '@/shadcn/components/ui/input';
import { cn } from '@/shadcn/lib/utils';
import { DatePickerWithRange } from '@/teamized/components/common/utils/datetime/dateRangePicker';
import { DateRangeRequired } from '@/teamized/utils/datetime';

export function formatTimeHHmm(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

export function parseTimeHHmm(
    timeStr: string
): { hours: number; minutes: number } | null {
    const match = new RegExp(/^(\d{1,2}):(\d{2})$/).exec(timeStr);
    if (!match) return null;
    const hours = Number.parseInt(match[1], 10);
    const minutes = Number.parseInt(match[2], 10);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return { hours, minutes };
}

/**
 * Returns default start and end dates representing today and the last full hour.
 * For example, at 14:35, returns start at 13:00 today and end at 14:00 today.
 * If current hour is 0 (e.g. 00:25), returns 00:00 to 01:00 today.
 */
export function getLastFullHourTimes(now: Date = new Date()): {
    startDate: Date;
    endDate: Date;
} {
    const start = new Date(now);
    const end = new Date(now);

    const currentHour = now.getHours();
    if (currentHour === 0) {
        start.setHours(0, 0, 0, 0);
        end.setHours(1, 0, 0, 0);
    } else {
        start.setHours(currentHour - 1, 0, 0, 0);
        end.setHours(currentHour, 0, 0, 0);
    }

    return { startDate: start, endDate: end };
}

export interface DateTimeRangePickerProps {
    startDate: Date;
    endDate: Date;
    onChange: (startDate: Date, endDate: Date) => void;
    disabled?: boolean;
    className?: string;
    startMonth?: Date;
    endMonth?: Date;
    dateLabel?: string;
    startTimeLabel?: string;
    endTimeLabel?: string;
}

export function DateTimeRangePicker({
    startDate,
    endDate,
    onChange,
    disabled = false,
    className,
    startMonth,
    endMonth,
    dateLabel = 'Datum',
    startTimeLabel = 'Von',
    endTimeLabel = 'Bis',
}: Readonly<DateTimeRangePickerProps>) {
    const [startTimeStr, setStartTimeStr] = useState(() =>
        formatTimeHHmm(startDate)
    );
    const [endTimeStr, setEndTimeStr] = useState(() => formatTimeHHmm(endDate));

    useEffect(() => {
        setStartTimeStr(formatTimeHHmm(startDate));
    }, [startDate]);

    useEffect(() => {
        setEndTimeStr(formatTimeHHmm(endDate));
    }, [endDate]);

    const handleDateRangeChange = (newRange: DateRangeRequired) => {
        const newStartDate = new Date(newRange.from);
        newStartDate.setHours(
            startDate.getHours(),
            startDate.getMinutes(),
            0,
            0
        );

        const newEndDate = new Date(newRange.to);
        newEndDate.setHours(endDate.getHours(), endDate.getMinutes(), 0, 0);

        onChange(newStartDate, newEndDate);
    };

    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setStartTimeStr(val);
        const parsed = parseTimeHHmm(val);
        if (!parsed) return;

        const currentDiffMs = endDate.getTime() - startDate.getTime();
        const durationMs = currentDiffMs > 0 ? currentDiffMs : 60 * 60 * 1000;

        const newStartDate = new Date(startDate);
        newStartDate.setHours(parsed.hours, parsed.minutes, 0, 0);

        const newEndDate = new Date(newStartDate.getTime() + durationMs);
        onChange(newStartDate, newEndDate);
    };

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setEndTimeStr(val);
        const parsed = parseTimeHHmm(val);
        if (!parsed) return;

        const newEndDate = new Date(endDate);
        newEndDate.setHours(parsed.hours, parsed.minutes, 0, 0);
        onChange(startDate, newEndDate);
    };

    return (
        <div className={cn('tw:flex tw:flex-col tw:gap-3', className)}>
            <Field>
                <FieldLabel>{dateLabel}</FieldLabel>
                <DatePickerWithRange
                    defaultValue={{ from: startDate, to: endDate }}
                    onChange={handleDateRangeChange}
                    className="tw:w-full"
                    buttonClassName="tw:w-full"
                    startMonth={startMonth}
                    endMonth={endMonth}
                    presets={[]}
                />
            </Field>

            <div className="tw:grid tw:grid-cols-2 tw:gap-3">
                <Field>
                    <FieldLabel htmlFor="datetime-start-time">
                        {startTimeLabel}
                    </FieldLabel>
                    <Input
                        id="datetime-start-time"
                        type="time"
                        value={startTimeStr}
                        onChange={handleStartTimeChange}
                        disabled={disabled}
                        required
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="datetime-end-time">
                        {endTimeLabel}
                    </FieldLabel>
                    <Input
                        id="datetime-end-time"
                        type="time"
                        value={endTimeStr}
                        onChange={handleEndTimeChange}
                        disabled={disabled}
                        required
                    />
                </Field>
            </div>
        </div>
    );
}
