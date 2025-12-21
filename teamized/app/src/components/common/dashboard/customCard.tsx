import { Loader2 } from 'lucide-react';
import React from 'react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/shadcn/components/ui/card';

import IconTooltip from '../tooltips/iconTooltip';

interface Props {
    title: string | React.ReactNode | null;
    help: string | null;
    grow: boolean;
    className: string;
    children: React.ReactNode;
    loading: boolean;
    ref: React.Ref<HTMLDivElement> | null;
}

export default function CustomCard({
    title = null,
    help = null,
    grow = false,
    className = '',
    children = null,
    loading = false,
    ref = null,
}: Readonly<Partial<Props>>) {
    const fullClassName = `dashboard-card tw:flex tw:flex-col ${grow ? 'tw:flex-grow' : ''} tw:m-1 ${className}`;

    return (
        <Card className={fullClassName} ref={ref}>
            {title && (
                <CardHeader>
                    <CardTitle className="tw:flex tw:items-center tw:gap-2">
                        {title}
                        {help && (
                            <IconTooltip
                                className="tw:text-muted-foreground"
                                title={help}
                            />
                        )}
                    </CardTitle>
                </CardHeader>
            )}
            {loading ? (
                <CardContent className={grow ? 'tw:flex-grow' : ''}>
                    <div className="tw:flex tw:flex-col tw:items-center tw:justify-center tw:my-5 tw:gap-2">
                        <Loader2 className="tw:size-6 tw:animate-spin tw:text-muted-foreground" />
                        <span className="tw:text-sm tw:text-muted-foreground">
                            Daten werden geladen...
                        </span>
                    </div>
                </CardContent>
            ) : (
                children
            )}
        </Card>
    );
}
