import React from 'react';
import { Tooltip } from './tooltip';

interface Props {
    title: string;
    icon: string;
    className: string;
}

export function IconTooltip({
    title,
    icon = 'fas fa-info-circle',
    className = '',
}: Partial<Props>) {
    return (
        <Tooltip className={className} title={title}>
            <i className={'fa-fw ' + icon}></i>
        </Tooltip>
    );
}
