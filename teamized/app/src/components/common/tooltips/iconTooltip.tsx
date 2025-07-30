import React from 'react';

import Tooltip from './tooltip';

interface Props {
    title: string;
    icon: string;
    className: string;
}

export default function IconTooltip({
    title,
    icon = 'fa-solid fa-info-circle',
    className = '',
}: Partial<Props>) {
    return (
        <Tooltip className={className} title={title}>
            <i className={icon}></i>
        </Tooltip>
    );
}
