import React from 'react';

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

export default function VerticalDataTable({ items, children }: Props) {
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
        <table className={`table mb-0`}>
            {slots.head}
            <tbody>
                {items
                    .map((item, index) => ({ item, index }))
                    .filter(({ item }) => !item.hide)
                    .map(({ item, index }) => (
                        <tr
                            key={index}
                            className={item.isDebugId ? 'debug-id' : ''}
                        >
                            <th
                                scope="row"
                                className={item.limitWidth ? 'pe-3' : ''}
                                style={{
                                    width: item.limitWidth ? '1px' : undefined,
                                }}
                            >
                                {item.label}:
                            </th>
                            <td>{item.value}</td>
                        </tr>
                    ))}
            </tbody>
            {slots.foot}
        </table>
    );
}
