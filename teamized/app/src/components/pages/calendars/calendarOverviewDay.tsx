import React from 'react';

import { CalendarEvent } from '../../../interfaces/calendar/calendarEvent';

interface Props {
    date: Date;
    isSelected: boolean;
    isToday: boolean;
    isInSelectedMonth: boolean;
    events: CalendarEvent[];
    onSelect: (date: Date) => any;
}

export default function CalendarOverviewDay({
    date,
    isSelected,
    isToday,
    isInSelectedMonth,
    events,
    onSelect,
}: Props) {
    const handleSelect = () => {
        onSelect(date);
    };

    const getDateClassName = () => {
        let className =
            'd-flex justify-content-center align-items-center flex-column rounded-circle dm-noinvert';
        if (isSelected && isToday) {
            className += ' bg-danger fw-bold ';
        } else if (isSelected) {
            className += ' bg-primary ';
        } else if (isToday) {
            className += ' text-danger fw-bold';
        } else {
            className += ' ';
        }

        if (!isInSelectedMonth) {
            className += ' opacity-50';
        }
        return className;
    };

    let colors: string[] = [];
    for (let event of events) {
        if (!colors.includes(event.calendar!.color)) {
            colors.push(event.calendar!.color);
        }
    }

    return (
        <div onClick={handleSelect}>
            <div
                className={getDateClassName()}
                style={{ width: '3em', height: '3em', cursor: 'pointer' }}
            >
                <span>{date.getDate()}</span>
                {isSelected ? null : (
                    <span style={{ fontSize: '0.4rem', height: '0.4rem' }}>
                        {colors.map((color) => (
                            <span key={color} style={{ color: color }}>
                                <i className="fas fa-circle"></i>
                            </span>
                        ))}
                    </span>
                )}
            </div>
        </div>
    );
}
