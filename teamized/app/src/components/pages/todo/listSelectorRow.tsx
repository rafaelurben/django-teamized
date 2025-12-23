import React from 'react';

import { cn } from '@/shadcn/lib/utils';
import { ID } from '@/teamized/interfaces/common';
import { Todolist } from '@/teamized/interfaces/todolist/todolist';

interface Props {
    list: Todolist;
    isSelected: boolean;
    onSelect: (listId: ID) => unknown;
}

export default function ListSelectorRow({
    list,
    isSelected,
    onSelect,
}: Readonly<Props>) {
    const handleSelect = () => {
        if (!isSelected) {
            onSelect(list.id);
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
                borderLeftColor: list.color,
                borderLeftStyle: 'solid',
            }}
            onClick={handleSelect}
            tabIndex={0}
        >
            <span className="tw:inline-block tw:w-full">{list.name}</span>
        </button>
    );
}
