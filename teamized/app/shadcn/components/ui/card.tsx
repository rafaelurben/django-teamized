import * as React from 'react';

import { cn } from '@/shadcn/lib/utils';

function Card({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card"
            className={cn(
                'tw:bg-card tw:text-card-foreground tw:rounded-lg tw:border tw:shadow-sm',
                className
            )}
            {...props}
        />
    );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-header"
            className={cn('tw:flex tw:flex-col tw:gap-y-1.5 tw:p-6', className)}
            {...props}
        />
    );
}

function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
    return (
        <h3
            data-slot="card-title"
            className={cn(
                'tw:text-2xl tw:font-semibold tw:leading-none tw:tracking-tight',
                className
            )}
            {...props}
        />
    );
}

function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
    return (
        <p
            data-slot="card-description"
            className={cn('tw:text-muted-foreground tw:text-sm', className)}
            {...props}
        />
    );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-content"
            className={cn('tw:p-6 tw:pt-0', className)}
            {...props}
        />
    );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-footer"
            className={cn('tw:flex tw:items-center tw:p-6 tw:pt-0', className)}
            {...props}
        />
    );
}

export {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
};
