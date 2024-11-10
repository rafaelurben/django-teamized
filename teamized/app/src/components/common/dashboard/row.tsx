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
}: Partial<Props>) {
    let fullClassName = `dashboard-row row w-100 g-0 ${className}`;

    if (grow) {
        fullClassName += ' flex-grow-1';
    }

    return <div className={fullClassName}>{children}</div>;
}
