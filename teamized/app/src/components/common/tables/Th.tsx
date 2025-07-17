import React from 'react';

interface Props {
    children: React.ReactNode;
    className?: string;
    noWrapFlex?: boolean;
}

export default function Th({
    className = '',
    children,
    noWrapFlex = false,
}: Props) {
    if (noWrapFlex) {
        return (
            <th className={`text-nowrap {className}`}>
                <div className="d-flex flex-nowrap gap-1">{children}</div>
            </th>
        );
    }

    return <th className={className}>{children}</th>;
}
