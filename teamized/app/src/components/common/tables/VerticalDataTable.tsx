import React from 'react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@/shadcn/components/ui/table';
import { cn } from '@/shadcn/lib/utils';

import ButtonFooter from './ButtonFooter';

interface DataItem {
    label: string;
    value: React.ReactNode;
    hide?: boolean;
    isDebugId?: boolean;
    limitWidth?: boolean;
}

interface Props {
    items: DataItem[];
    children: React.ReactNode;
}

export default function VerticalDataTable({
    items,
    children,
}: Readonly<Props>) {
    const slots: Record<string, React.ReactNode> = {
        head: null,
        foot: null,
    };

    React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
            switch (child.type) {
                case 'thead':
                    slots.head = child;
                    break;
                case 'tfoot':
                case ButtonFooter:
                    slots.foot = child;
                    break;
                default:
                    console.warn(
                        'VerticalDataTable: Unsupported child type',
                        child.type
                    );
                    break;
            }
        }
    });

    return (
        <Table>
            {slots.head}
            <TableBody>
                {items
                    .map((item, index) => ({ item, index }))
                    .filter(({ item }) => !item.hide)
                    .map(({ item, index }) => (
                        <TableRow
                            key={index}
                            className={item.isDebugId ? 'debug-id' : ''}
                        >
                            <TableHead
                                scope="row"
                                className={cn(
                                    item.limitWidth
                                        ? 'tw:pe-3 tw:w-px'
                                        : 'tw:whitespace-normal',
                                    item.isDebugId
                                        ? 'tw:text-muted-foreground'
                                        : ''
                                )}
                            >
                                {item.label}:
                            </TableHead>
                            <TableCell
                                className={item.isDebugId ? 'tw:text-xs' : ''}
                            >
                                {item.value}
                            </TableCell>
                        </TableRow>
                    ))}
            </TableBody>
            {slots.foot}
        </Table>
    );
}
