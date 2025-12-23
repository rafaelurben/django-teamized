import React from 'react';

import {
    Tooltip as ShadcnTooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/shadcn/components/ui/tooltip';

interface Props {
    title: string;
    className: string;
    children: React.ReactNode;
}

export default function CustomTooltip({
    title,
    className = '',
    children,
}: Readonly<Partial<Props>>) {
    return (
        <ShadcnTooltip>
            <TooltipTrigger asChild>
                <span className={className}>{children}</span>
            </TooltipTrigger>
            <TooltipContent>
                <p>{title}</p>
            </TooltipContent>
        </ShadcnTooltip>
    );
}
