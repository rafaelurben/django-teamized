import { Tooltip as BSTooltip } from 'bootstrap';
import React, { useEffect, useRef } from 'react';

interface Props {
    title: string;
    className: string;
    children: React.ReactNode;
}

export default function Tooltip({
    title,
    className = '',
    children,
}: Partial<Props>) {
    const tooltipRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const tooltip = new BSTooltip(tooltipRef.current as HTMLElement);

        return () => tooltip.dispose();
    }, []);

    return (
        <abbr
            className={className}
            title={title}
            data-bs-toggle="tooltip"
            ref={tooltipRef}
        >
            {children}
        </abbr>
    );
}
