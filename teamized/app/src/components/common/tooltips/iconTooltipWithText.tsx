import { LucideIcon } from 'lucide-react';
import React from 'react';

import { cn } from '@/shadcn/lib/utils';
import IconTooltip from '@/teamized/components/common/tooltips/iconTooltip';

interface Props {
    title: string;
    text: string;
    icon?: LucideIcon;
    className: string;
}

export default function IconTooltipWithText({
    title,
    text,
    icon,
    className = '',
}: Readonly<Partial<Props>>) {
    return (
        <span className={cn('tw:inline-block', className)}>
            <span>{text}</span>
            <IconTooltip
                className="tw:ml-1 tw:inline-block"
                icon={icon}
                title={title}
            />
        </span>
    );
}
