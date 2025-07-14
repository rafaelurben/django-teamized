import React from 'react';

import { ClubPresenceEvent } from '../../../interfaces/club/clubPresenceEvent';
import { ID } from '../../../interfaces/common';

interface Props {
    isSelected: boolean;
    onSelect: (id: ID) => unknown;
    event: ClubPresenceEvent;
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

    const dateTimeFmt = (date_str: string) => {
        return new Date(date_str).toLocaleDateString('de-CH', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="py-1 mb-1" style={getStyle()} onClick={handleSelect}>
            <span className="d-flex w-100 flex-column">
                <span>{event.title}</span>
                <span className="text-muted">
                    {dateTimeFmt(event.dt_start)} - {dateTimeFmt(event.dt_end)}
                </span>
            </span>
        </div>
    );
}
