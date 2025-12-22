import React from 'react';

import { cn } from '@/shadcn/lib/utils';

import { Calendar } from '../../../interfaces/calendar/calendar';
import { ID } from '../../../interfaces/common';

interface Props {
    isSelected: boolean;
    onSelect: (id: ID) => unknown;
    calendar: Calendar;
}

export default function CalendarSelectorRow({
    isSelected,
    onSelect,
    calendar,
}: Readonly<Props>) {
    const handleSelect = () => {
        if (!isSelected) {
            onSelect(calendar.id);
        }
    };

    return (
        <button
            className={cn(
                'tw:py-1 tw:mb-1 tw:cursor-pointer tw:transition-opacity tw:text-left',
                isSelected
                    ? 'tw:pl-2 tw:border-l-8 tw:opacity-100 tw:font-bold'
                    : 'tw:pl-2.75 tw:border-l-[5px] tw:opacity-75 tw:font-normal'
            )}
            style={{
                borderLeftColor: calendar.color,
                borderLeftStyle: 'solid',
            }}
            onClick={handleSelect}
            tabIndex={0}
        >
            <span className="tw:inline-block tw:w-full">{calendar.name}</span>
        </button>
    );
}
