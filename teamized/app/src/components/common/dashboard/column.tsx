import React from 'react';

import { cn } from '@/shadcn/lib/utils';

// Note: Because tailwind cannot detect dynamic class names, these must be
// kept in sync with styles/globals.css!
type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type Size = 2 | 3 | 4 | 6 | 8 | 9 | 12;

const SIZES = {
    2: 'w-1/6',
    3: 'w-1/4',
    4: 'w-1/3',
    6: 'w-1/2',
    8: 'w-2/3',
    9: 'w-3/4',
    10: 'w-5/6',
    12: 'w-full',
};

interface Props {
    className: string;
    sizes: {
        [key in Breakpoint]?: Size;
    };
    grow: boolean;
    children: React.ReactNode;
}

export default function Column({
    className = '',
    sizes = {},
    grow = false,
    children,
}: Readonly<Partial<Props>>) {
    const fullClassName = cn(
        'dashboard-column tw:flex tw:flex-col tw:w-full',
        ...Object.entries(sizes).map(
            ([breakpoint, sz]) => `tw:${breakpoint}:${SIZES[sz]}`
        ),
        grow ? 'tw:flex-grow' : '',
        className
    );

    return <div className={fullClassName}>{children}</div>;
}
