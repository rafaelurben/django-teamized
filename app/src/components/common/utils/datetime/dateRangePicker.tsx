'use client';

import {
    endOfDay,
    endOfMonth,
    endOfYear,
    startOfDay,
    startOfMonth,
    startOfYear,
    subDays,
    subMonths,
    subYears,
} from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { type DateRange } from 'react-day-picker';

import { Button } from '@/shadcn/components/ui/button';
import { Calendar } from '@/shadcn/components/ui/calendar';
import { Field } from '@/shadcn/components/ui/field';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shadcn/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shadcn/components/ui/select';
import { cn } from '@/shadcn/lib/utils';
import { DateRangeRequired, isSameDate } from '@/teamized/utils/datetime';

export interface DateRangePreset {
    label: string;
    range: DateRangeRequired;
}

export function getDefaultPresets(): DateRangePreset[] {
    const today = startOfDay(new Date());

    return [
        {
            label: 'Dieser Monat',
            range: {
                from: startOfMonth(today),
                to: endOfMonth(today),
            },
        },
        {
            label: 'Letzter Monat',
            range: {
                from: startOfMonth(subMonths(today, 1)),
                to: endOfMonth(subMonths(today, 1)),
            },
        },
        {
            label: 'Dieses Jahr',
            range: {
                from: startOfYear(today),
                to: endOfYear(today),
            },
        },
        {
            label: 'Letztes Jahr',
            range: {
                from: startOfYear(subYears(today, 1)),
                to: endOfYear(subYears(today, 1)),
            },
        },
        {
            label: 'Letzte 7 Tage',
            range: {
                from: subDays(today, 6),
                to: endOfDay(today),
            },
        },
        {
            label: 'Letzte 30 Tage',
            range: {
                from: subDays(today, 29),
                to: endOfDay(today),
            },
        },
    ];
}

interface Props {
    defaultValue: DateRangeRequired;
    onChange: (date: DateRangeRequired) => void;
    startMonth?: Date;
    endMonth?: Date;
    presets?: DateRangePreset[];
    className?: string;
    buttonClassName?: string;
}

export function DatePickerWithRange({
    defaultValue,
    onChange,
    startMonth = new Date(2021, 11, 25),
    endMonth = new Date(),
    presets,
    className,
    buttonClassName,
}: Readonly<Props>) {
    const activePresets = useMemo(
        () => presets ?? getDefaultPresets(),
        [presets]
    );

    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        defaultValue
    );
    const [month, setMonth] = useState<Date | undefined>(defaultValue.from);

    useEffect(() => {
        setDateRange(defaultValue);
        setMonth(defaultValue.from);
    }, [defaultValue]);

    const handleDateChange = (newDateRange: DateRange | undefined) => {
        setDateRange(newDateRange);
        if (
            newDateRange?.from !== undefined &&
            newDateRange?.to !== undefined
        ) {
            const newDateRangeRequired = {
                from: newDateRange.from,
                to: newDateRange.to,
            };
            onChange(newDateRangeRequired);
        }
    };

    const handlePresetChange = (label: string) => {
        const selectedPreset = activePresets.find((p) => p.label === label);
        if (selectedPreset) {
            setDateRange(selectedPreset.range);
            onChange(selectedPreset.range);
            setMonth(selectedPreset.range.from);
        }
    };

    const selectedPreset = useMemo(() => {
        if (!dateRange?.from || !dateRange?.to) {
            return undefined;
        }
        return activePresets.find(
            (preset) =>
                isSameDate(preset.range.from, dateRange.from!) &&
                isSameDate(preset.range.to, dateRange.to!)
        )?.label;
    }, [activePresets, dateRange]);

    return (
        <Field
            className={cn('mx-auto w-60', className)}
            aria-description="Datumsbereich auswählen"
        >
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id="date-picker-range"
                        className={cn(
                            'justify-start px-2.5 font-normal',
                            buttonClassName
                        )}
                    >
                        <CalendarIcon />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                    {dateRange.from.toLocaleDateString()} -{' '}
                                    {dateRange.to.toLocaleDateString()}
                                </>
                            ) : (
                                dateRange.from.toLocaleDateString()
                            )
                        ) : (
                            <span>Bereich auswählen</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="tw:w-auto tw:p-0" align="end">
                    {activePresets.length > 0 && (
                        <div className="tw:border-b tw:border-border tw:p-3">
                            <Select
                                value={selectedPreset ?? ''}
                                onValueChange={handlePresetChange}
                            >
                                <SelectTrigger className="tw:w-full">
                                    <SelectValue placeholder="Zeitraum auswählen" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    {activePresets.map((preset) => (
                                        <SelectItem
                                            key={preset.label}
                                            value={preset.label}
                                        >
                                            {preset.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <Calendar
                        mode="range"
                        captionLayout="dropdown"
                        required={true}
                        month={month}
                        onMonthChange={setMonth}
                        selected={dateRange}
                        onSelect={handleDateChange}
                        numberOfMonths={1}
                        startMonth={startMonth}
                        endMonth={endMonth}
                        weekStartsOn={1}
                    />
                </PopoverContent>
            </Popover>
        </Field>
    );
}
