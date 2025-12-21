import { Info, LucideIcon } from 'lucide-react';
import React from 'react';

import { cn } from '@/shadcn/lib/utils';

import Tooltip from './tooltip';

interface Props {
    title: string;
    icon: string | LucideIcon;
    className: string;
    iconClassName: string;
}

export default function IconTooltip({
    title,
    icon = Info,
    className = '',
    iconClassName = '',
}: Readonly<Partial<Props>>) {
    const data = { icon }; // Wrap in an object to use as a component
    return (
        <Tooltip className={className} title={title}>
            {typeof data.icon === 'string' ? (
                <i className={data.icon} />
            ) : (
                <data.icon className={cn('tw:size-4', iconClassName)} />
            )}
        </Tooltip>
    );
}
