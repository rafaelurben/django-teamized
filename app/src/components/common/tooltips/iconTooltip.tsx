import { InfoIcon, LucideIcon } from 'lucide-react';
import React from 'react';

import CustomTooltip from './customTooltip';

interface Props {
    title: string;
    icon: LucideIcon;
    className: string;
}

export default function IconTooltip({
    title,
    icon = InfoIcon,
    className = '',
}: Readonly<Partial<Props>>) {
    const data = { icon }; // Wrap in an object to use as a component
    return (
        <CustomTooltip className={className} title={title}>
            <data.icon className="tw:size-4" />
        </CustomTooltip>
    );
}
