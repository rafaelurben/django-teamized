import React from 'react';

import { ClubAttendanceEvent } from '../../../interfaces/club/clubAttendanceEvent';
import { ID } from '../../../interfaces/common';
import { getDateTimeString } from '../../../utils/datetime';

interface Props {
    isSelected: boolean;
    onSelect: (id: ID) => unknown;
    event: ClubAttendanceEvent;
}

export default function EventSelectorRow({
    isSelected,
    onSelect,
    event,
}: Props) {
    const handleSelect = () => {
        if (!isSelected) {
            onSelect(event.id);
        }
    };

    const getStyle = () => {
        return {
            paddingLeft: isSelected ? '.5rem' : 'calc(.5rem + 3px)',
            borderLeftWidth: isSelected ? '8px' : '5px',
            borderLeftColor: 'white',
            borderLeftStyle: 'solid',
            cursor: 'pointer',
            opacity: isSelected ? 1 : 0.75,
            fontWeight: isSelected ? 'bold' : 'normal',
        } satisfies React.CSSProperties;
    };

    return (
        <div className="py-1 mb-1" style={getStyle()} onClick={handleSelect}>
            <span className="d-flex w-100 flex-column">
                <span>{event.title}</span>
                <span className="text-muted">
                    {getDateTimeString(new Date(event.dt_start))}
                    {' - '}
                    {getDateTimeString(new Date(event.dt_end))}
                </span>
            </span>
        </div>
    );
}
