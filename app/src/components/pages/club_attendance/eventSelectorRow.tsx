import React from 'react';

import { cn } from '@/shadcn/lib/utils';
import { ClubAttendanceEvent } from '@/teamized/interfaces/club/clubAttendanceEvent';
import { ID } from '@/teamized/interfaces/common';
import { getDateTimeString } from '@/teamized/utils/datetime';

interface Props {
    isSelected: boolean;
    onSelect: (id: ID) => unknown;
    event: ClubAttendanceEvent;
}

export default function EventSelectorRow({
    isSelected,
    onSelect,
    event,
}: Readonly<Props>) {
    const handleSelect = () => {
        if (!isSelected) {
            onSelect(event.id);
        }
    };

    return (
        <button
            className={cn(
                'tw:py-1 tw:mb-1 tw:cursor-pointer tw:transition-opacity tw:text-left',
                isSelected
                    ? 'tw:pl-2 tw:border-l-8 tw:opacity-100 tw:font-bold'
                    : 'tw:pl-2.75 tw:border-l-[5px] tw:opacity-75 tw:font-normal',
                'tw:border-l-foreground'
            )}
            onClick={handleSelect}
            tabIndex={0}
        >
            <span className="tw:flex tw:w-full tw:flex-col">
                <span>{event.title}</span>
                <span className="tw:text-muted-foreground">
                    {getDateTimeString(new Date(event.dt_start))}
                    {' - '}
                    {getDateTimeString(new Date(event.dt_end))}
                </span>
            </span>
        </button>
    );
}
