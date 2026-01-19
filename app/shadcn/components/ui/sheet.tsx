'use client';

import * as SheetPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/shadcn/lib/utils';

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
    return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
    return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
    return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
    return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
    className,
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
    return (
        <SheetPrimitive.Overlay
            data-slot="sheet-overlay"
            className={cn(
                'tw:data-[state=open]:animate-in tw:data-[state=closed]:animate-out tw:data-[state=closed]:fade-out-0 tw:data-[state=open]:fade-in-0 tw:fixed tw:inset-0 tw:z-50 tw:bg-black/50',
                className
            )}
            {...props}
        />
    );
}

function SheetContent({
    className,
    children,
    side = 'right',
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
    side?: 'top' | 'right' | 'bottom' | 'left';
}) {
    return (
        <SheetPortal>
            <SheetOverlay />
            <SheetPrimitive.Content
                data-slot="sheet-content"
                className={cn(
                    'tw:bg-background tw:data-[state=open]:animate-in tw:data-[state=closed]:animate-out tw:fixed tw:z-50 tw:flex tw:flex-col tw:gap-4 tw:shadow-lg tw:transition tw:ease-in-out tw:data-[state=closed]:duration-300 tw:data-[state=open]:duration-500',
                    side === 'right' &&
                        'tw:data-[state=closed]:slide-out-to-right tw:data-[state=open]:slide-in-from-right tw:inset-y-0 tw:right-0 tw:h-full tw:w-3/4 tw:border-l tw:sm:max-w-sm',
                    side === 'left' &&
                        'tw:data-[state=closed]:slide-out-to-left tw:data-[state=open]:slide-in-from-left tw:inset-y-0 tw:left-0 tw:h-full tw:w-3/4 tw:border-r tw:sm:max-w-sm',
                    side === 'top' &&
                        'tw:data-[state=closed]:slide-out-to-top tw:data-[state=open]:slide-in-from-top tw:inset-x-0 tw:top-0 tw:h-auto tw:border-b',
                    side === 'bottom' &&
                        'tw:data-[state=closed]:slide-out-to-bottom tw:data-[state=open]:slide-in-from-bottom tw:inset-x-0 tw:bottom-0 tw:h-auto tw:border-t',
                    className
                )}
                {...props}
            >
                {children}
                <SheetPrimitive.Close className="tw:ring-offset-background tw:focus:ring-ring tw:data-[state=open]:bg-secondary tw:absolute tw:top-4 tw:right-4 tw:rounded-xs tw:opacity-70 tw:transition-opacity tw:hover:opacity-100 tw:focus:ring-2 tw:focus:ring-offset-2 tw:focus:outline-hidden tw:disabled:pointer-events-none">
                    <XIcon className="tw:size-4" />
                    <span className="tw:sr-only">Close</span>
                </SheetPrimitive.Close>
            </SheetPrimitive.Content>
        </SheetPortal>
    );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="sheet-header"
            className={cn('tw:flex tw:flex-col tw:gap-1.5 tw:p-4', className)}
            {...props}
        />
    );
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="sheet-footer"
            className={cn(
                'tw:mt-auto tw:flex tw:flex-col tw:gap-2 tw:p-4',
                className
            )}
            {...props}
        />
    );
}

function SheetTitle({
    className,
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
    return (
        <SheetPrimitive.Title
            data-slot="sheet-title"
            className={cn('tw:text-foreground tw:font-semibold', className)}
            {...props}
        />
    );
}

function SheetDescription({
    className,
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
    return (
        <SheetPrimitive.Description
            data-slot="sheet-description"
            className={cn('tw:text-muted-foreground tw:text-sm', className)}
            {...props}
        />
    );
}

export {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
};
