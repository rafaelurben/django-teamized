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
}: Readonly<Props>) {
    if (noWrapFlex) {
        return (
            <th className={`tw:whitespace-nowrap ${className}`}>
                <div className="tw:flex tw:flex-nowrap tw:gap-1">
                    {children}
                </div>
            </th>
        );
    }

    return <th className={`tw:text-left ${className}`}>{children}</th>;
}
