import React from 'react';

interface Props {
    className: string;
    grow: boolean;
    children: React.ReactNode;
}

export default function Row({
    className = '',
    grow = false,
    children,
}: Readonly<Partial<Props>>) {
    const fullClassName = `dashboard-row tw:flex tw:flex-wrap tw:w-full ${grow ? 'tw:flex-grow' : ''} ${className}`;

    return <div className={fullClassName}>{children}</div>;
}
