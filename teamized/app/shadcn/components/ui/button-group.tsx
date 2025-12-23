import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

import { Separator } from '@/shadcn/components/ui/separator';
import { cn } from '@/shadcn/lib/utils';

const buttonGroupVariants = cva(
    'tw:flex tw:w-fit tw:items-stretch tw:[&>*]:focus-visible:z-10 tw:[&>*]:focus-visible:relative tw:[&>[data-slot=select-trigger]:not([class*=w-])]:w-fit tw:[&>input]:flex-1 tw:has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md tw:has-[>[data-slot=button-group]]:gap-2',
    {
        variants: {
            orientation: {
                horizontal:
                    'tw:[&>*:not(:first-child)]:rounded-l-none tw:[&>*:not(:first-child)]:border-l-0 tw:[&>*:not(:last-child)]:rounded-r-none',
                vertical:
                    'tw:flex-col tw:[&>*:not(:first-child)]:rounded-t-none tw:[&>*:not(:first-child)]:border-t-0 tw:[&>*:not(:last-child)]:rounded-b-none',
            },
        },
        defaultVariants: {
            orientation: 'horizontal',
        },
    }
);

function ButtonGroup({
    className,
    orientation,
    ...props
}: React.ComponentProps<'div'> & VariantProps<typeof buttonGroupVariants>) {
    return (
        <div
            role="group"
            data-slot="button-group"
            data-orientation={orientation}
            className={cn(buttonGroupVariants({ orientation }), className)}
            {...props}
        />
    );
}

function ButtonGroupText({
    className,
    asChild = false,
    ...props
}: React.ComponentProps<'div'> & {
    asChild?: boolean;
}) {
    const Comp = asChild ? Slot : 'div';

    return (
        <Comp
            className={cn(
                'tw:bg-muted tw:flex tw:items-center tw:gap-2 tw:rounded-md tw:border tw:px-4 tw:text-sm tw:font-medium tw:shadow-xs tw:[&_svg]:pointer-events-none tw:[&_svg:not([class*=size-])]:size-4',
                className
            )}
            {...props}
        />
    );
}

function ButtonGroupSeparator({
    className,
    orientation = 'vertical',
    ...props
}: React.ComponentProps<typeof Separator>) {
    return (
        <Separator
            data-slot="button-group-separator"
            orientation={orientation}
            className={cn(
                'tw:bg-input tw:relative tw:!m-0 tw:self-stretch tw:data-[orientation=vertical]:h-auto',
                className
            )}
            {...props}
        />
    );
}

export {
    ButtonGroup,
    ButtonGroupSeparator,
    ButtonGroupText,
    buttonGroupVariants,
};
