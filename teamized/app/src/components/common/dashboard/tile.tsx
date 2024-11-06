import React from 'react';

import { IconTooltip } from '../tooltips/iconTooltip';

interface Props {
    title: string | null;
    help: string | null;
    grow: boolean;
    className: string;
    children: React.ReactNode;
}

export function Tile({
    title = null,
    help = null,
    grow = false,
    className = '',
    children = null,
}: Partial<Props>) {
    let fullClassName = `dashboard-tile row border border-dark rounded mx-2 mb-3 mt-0 flex-column ${className}`;

    if (grow) {
        fullClassName += ' flex-grow-1';
    }

    return (
        <div className={fullClassName}>
            {title && (
                <>
                    <h5
                        key="title"
                        className="dashboard-tile-title pt-2 text-bold"
                        style={{ flexBasis: 0 }}
                    >
                        {title}
                        {help && (
                            <IconTooltip className="ms-2 small" title={help} />
                        )}
                    </h5>
                    <hr key="hr" className="m-0" />
                </>
            )}
            <div className="p-2 w-100 overflow-auto flex-grow-1">
                {children}
            </div>
        </div>
    );
}
