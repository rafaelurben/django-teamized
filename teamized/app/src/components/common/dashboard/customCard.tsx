import { Loader2Icon } from 'lucide-react';
import React from 'react';

import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shadcn/components/ui/card';
import IconTooltip from '@/teamized/components/common/tooltips/iconTooltip';

interface Props {
    title?: string | React.ReactNode;
    help?: string;
    description?: string | React.ReactNode;
    action?: React.ReactNode;
    grow: boolean;
    className: string;
    children: React.ReactNode;
    loading: boolean;
    ref?: React.Ref<HTMLDivElement>;
    /**
     * If true, the children will be wrapped in CardContent.
     */
    wrapInCardContent?: boolean;
}

export default function CustomCard({
    title,
    help,
    description,
    action,
    grow = false,
    className = '',
    children,
    loading = false,
    ref,
    wrapInCardContent,
}: Readonly<Partial<Props>>) {
    const fullClassName = `dashboard-card tw:flex tw:flex-col ${grow ? 'tw:flex-grow' : ''} tw:m-1 ${className}`;

    return (
        <Card className={fullClassName} ref={ref}>
            {(title || action) && (
                <CardHeader>
                    {title && (
                        <CardTitle className="tw:flex tw:items-center tw:gap-2">
                            {title}
                            {help && (
                                <IconTooltip
                                    className="tw:text-muted-foreground"
                                    title={help}
                                />
                            )}
                        </CardTitle>
                    )}
                    {description && (
                        <CardDescription>{description}</CardDescription>
                    )}
                    {action && <CardAction>{action}</CardAction>}
                </CardHeader>
            )}
            {loading ? (
                <CardContent className={grow ? 'tw:grow' : ''}>
                    <div className="tw:flex tw:flex-col tw:items-center tw:justify-center tw:my-5 tw:gap-2">
                        <Loader2Icon className="tw:size-6 tw:animate-spin" />
                        <span className="tw:text-sm">
                            Daten werden geladen...
                        </span>
                    </div>
                </CardContent>
            ) : wrapInCardContent ? (
                <CardContent className={grow ? 'tw:grow' : ''}>
                    {children}
                </CardContent>
            ) : (
                children
            )}
        </Card>
    );
}
