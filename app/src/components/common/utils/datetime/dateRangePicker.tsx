'use client';

import { CalendarIcon } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';
import { type DateRange } from 'react-day-picker';

import { Button } from '@/shadcn/components/ui/button';
import { Calendar } from '@/shadcn/components/ui/calendar';
import { Field } from '@/shadcn/components/ui/field';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shadcn/components/ui/popover';
import { DateRangeRequired } from '@/teamized/utils/datetime';

interface Props {
    defaultValue: DateRangeRequired;
    onChange: (date: DateRangeRequired) => void;
    startMonth?: Date;
    endMonth?: Date;
}

export function DatePickerWithRange({
    defaultValue,
    onChange,
    startMonth = new Date(2021, 11, 25),
    endMonth = new Date(),
}: Readonly<Props>) {
    const [dateRange, setDateRange] = useState<DateRangeRequired>(defaultValue);

    const handleDateChange = (newDateRange: DateRange) => {
        if (newDateRange.from !== undefined && newDateRange.to !== undefined) {
            const newDateRangeRequired = {
                from: newDateRange.from,
                to: newDateRange.to,
            };
            setDateRange(newDateRangeRequired);
            onChange(newDateRangeRequired);
        }
    };

    return (
        <Field
            className="mx-auto w-60"
            aria-description="Datumsbereich auswählen"
        >
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id="date-picker-range"
                        className="justify-start px-2.5 font-normal"
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
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        mode="range"
                        captionLayout="dropdown"
                        required={true}
                        defaultMonth={dateRange?.from}
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
