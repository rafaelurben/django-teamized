import React from 'react';

import { ID } from '../../../interfaces/common';
import { Todolist } from '../../../interfaces/todolist/todolist';

interface Props {
    list: Todolist;
    isSelected: boolean;
    onSelect: (listId: ID) => unknown;
}

export default function ListSelectorRow({ list, isSelected, onSelect }: Props) {
    const handleSelect = () => {
        if (!isSelected) {
            onSelect(list.id);
        }
    };

    const getStyle = () => {
        return {
            paddingLeft: isSelected ? '.5rem' : 'calc(.5rem + 3px)',
            borderLeftWidth: isSelected ? '8px' : '5px',
            borderLeftColor: list.color,
            borderLeftStyle: 'solid',
            cursor: 'pointer',
            opacity: isSelected ? 1 : 0.75,
            fontWeight: isSelected ? 'bold' : 'normal',
        } as React.CSSProperties;
    };

    return (
        <div className="py-1 mb-1" style={getStyle()} onClick={handleSelect}>
            <span className="d-inline-block w-100">{list.name}</span>
        </div>
    );
}
