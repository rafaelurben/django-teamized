import React from 'react';

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
}: Props) {
    const handleSelect = () => {
        if (!isSelected) {
            onSelect(calendar.id);
        }
    };

    const getStyle = () => {
        return {
            paddingLeft: isSelected ? '.5rem' : 'calc(.5rem + 3px)',
            borderLeftWidth: isSelected ? '8px' : '5px',
            borderLeftColor: calendar.color,
            borderLeftStyle: 'solid',
            cursor: 'pointer',
            opacity: isSelected ? 1 : 0.75,
            fontWeight: isSelected ? 'bold' : 'normal',
        } as React.CSSProperties;
    };

    return (
        <div className="py-1 mb-1" style={getStyle()} onClick={handleSelect}>
            <span className="d-inline-block w-100">{calendar.name}</span>
        </div>
    );
}
