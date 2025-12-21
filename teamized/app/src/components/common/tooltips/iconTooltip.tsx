import { Info } from 'lucide-react';
import React from 'react';

import Tooltip from './tooltip';

interface Props {
    title: string;
    icon: React.ReactNode;
    className: string;
}

export default function IconTooltip({
    title,
    icon = <Info className="tw:size-4" />,
    className = '',
}: Readonly<Partial<Props>>) {
    return (
        <Tooltip className={className} title={title}>
            {icon}
        </Tooltip>
    );
}
