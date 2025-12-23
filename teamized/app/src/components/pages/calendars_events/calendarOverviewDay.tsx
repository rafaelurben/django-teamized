import { CircleIcon } from 'lucide-react';
import React from 'react';

import { cn } from '@/shadcn/lib/utils';

import { CalendarEvent } from '../../../interfaces/calendar/calendarEvent';

interface Props {
    date: Date;
    isSelected: boolean;
    isToday: boolean;
    isInSelectedMonth: boolean;
    events: CalendarEvent[];
    onSelect: (date: Date) => unknown;
}

export default function CalendarOverviewDay({
    date,
    isSelected,
    isToday,
    isInSelectedMonth,
    events,
    onSelect,
}: Readonly<Props>) {
    const handleSelect = () => {
        onSelect(date);
    };

    const getDateClassName = () => {
        const classNames = [
            'tw:flex tw:justify-center tw:items-center tw:flex-col tw:rounded-full tw:w-12 tw:h-12 tw:cursor-pointer',
        ];
        if (isSelected && isToday) {
            classNames.push(
                'tw:bg-destructive tw:font-bold tw:text-destructive-foreground'
            );
        } else if (isSelected) {
            classNames.push('tw:bg-primary tw:text-primary-foreground');
        } else if (isToday) {
            classNames.push('tw:text-destructive tw:font-bold');
        }

        if (!isInSelectedMonth) {
            classNames.push('tw:opacity-50');
        }
        return cn(...classNames);
    };

    const colors: string[] = [];
    for (const event of events) {
        if (!colors.includes(event.calendar!.color)) {
            colors.push(event.calendar!.color);
        }
    }

    return (
        <button onClick={handleSelect} tabIndex={0}>
            <div className={getDateClassName()}>
                <span>{date.getDate()}</span>
                {!isSelected && (
                    <span className="tw:flex tw:gap-0.5">
                        {colors.map((color) => (
                            <CircleIcon
                                key={color}
                                className="tw:fill-current tw:w-2 tw:h-2"
                                style={{ color: color }}
                            />
                        ))}
                    </span>
                )}
            </div>
        </button>
    );
}
