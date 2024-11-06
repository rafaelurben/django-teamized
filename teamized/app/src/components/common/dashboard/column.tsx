import React from 'react';

interface Props {
    className: string;
    size: number;
    sizes: { [key: string]: number };
    grow: boolean;
    children: React.ReactNode;
}

export function Column({
    className = '',
    size = 12,
    sizes = {},
    grow = false,
    children,
}: Partial<Props>) {
    let fullClassName = `dashboard-column d-flex flex-column ${className} col-${size}`;
    for (let breakpoint of Object.keys(sizes)) {
        fullClassName += ` col-${breakpoint}-${sizes[breakpoint]}`;
    }
    if (grow) {
        fullClassName += ' flex-grow-1';
    }

    return <div className={fullClassName}>{children}</div>;
}
