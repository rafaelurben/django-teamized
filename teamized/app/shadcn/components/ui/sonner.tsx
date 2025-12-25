import {
    CircleCheckIcon,
    InfoIcon,
    Loader2Icon,
    OctagonXIcon,
    TriangleAlertIcon,
} from 'lucide-react';
import React from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ theme, ...props }: ToasterProps) => {
    return (
        <Sonner
            theme={theme}
            className="tw:toaster tw:group"
            icons={{
                success: <CircleCheckIcon className="tw:size-4" />,
                info: <InfoIcon className="tw:size-4" />,
                warning: <TriangleAlertIcon className="tw:size-4" />,
                error: <OctagonXIcon className="tw:size-4" />,
                loading: <Loader2Icon className="tw:size-4 tw:animate-spin" />,
            }}
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                    '--border-radius': 'var(--radius)',
                } as React.CSSProperties
            }
            {...props}
        />
    );
};

export { Toaster };
