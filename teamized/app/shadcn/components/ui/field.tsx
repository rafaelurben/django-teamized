import { cva, type VariantProps } from 'class-variance-authority';
import React, { useMemo } from 'react';

import { cn } from '@/shadcn/lib/utils';

import { Label } from './label';
import { Separator } from './separator';

function FieldSet({ className, ...props }: React.ComponentProps<'fieldset'>) {
    return (
        <fieldset
            data-slot="field-set"
            className={cn(
                'tw:flex tw:flex-col tw:gap-6',
                'tw:has-[>[data-slot=checkbox-group]]:gap-3 tw:has-[>[data-slot=radio-group]]:gap-3',
                className
            )}
            {...props}
        />
    );
}

function FieldLegend({
    className,
    variant = 'legend',
    ...props
}: React.ComponentProps<'legend'> & { variant?: 'legend' | 'label' }) {
    return (
        <legend
            data-slot="field-legend"
            data-variant={variant}
            className={cn(
                'tw:mb-3 tw:font-medium',
                'tw:data-[variant=legend]:text-base',
                'tw:data-[variant=label]:text-sm',
                className
            )}
            {...props}
        />
    );
}

function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="field-group"
            className={cn(
                'tw:group/field-group tw:@container/field-group tw:flex tw:w-full tw:flex-col tw:gap-7 tw:data-[slot=checkbox-group]:gap-3 tw:[&>[data-slot=field-group]]:gap-4',
                className
            )}
            {...props}
        />
    );
}

const fieldVariants = cva(
    'tw:group/field tw:flex tw:w-full tw:gap-3 tw:data-[invalid=true]:text-destructive',
    {
        variants: {
            orientation: {
                vertical: [
                    'tw:flex-col tw:[&>*]:w-full tw:[&>.sr-only]:w-auto',
                ],
                horizontal: [
                    'tw:flex-row tw:items-center',
                    'tw:[&>[data-slot=field-label]]:flex-auto',
                    'tw:has-[>[data-slot=field-content]]:items-start tw:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
                ],
                responsive: [
                    'tw:flex-col tw:[&>*]:w-full tw:[&>.sr-only]:w-auto @md/field-group:flex-row tw:@md/field-group:items-center tw:@md/field-group:[&>*]:w-auto',
                    'tw:@md/field-group:[&>[data-slot=field-label]]:flex-auto',
                    'tw:@md/field-group:has-[>[data-slot=field-content]]:items-start tw:@md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
                ],
            },
        },
        defaultVariants: {
            orientation: 'vertical',
        },
    }
);

function Field({
    className,
    orientation = 'vertical',
    ...props
}: React.ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
    return (
        <div
            role="group"
            data-slot="field"
            data-orientation={orientation}
            className={cn(fieldVariants({ orientation }), className)}
            {...props}
        />
    );
}

function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="field-content"
            className={cn(
                'tw:group/field-content tw:flex tw:flex-1 tw:flex-col tw:gap-1.5 tw:leading-snug',
                className
            )}
            {...props}
        />
    );
}

function FieldLabel({
    className,
    ...props
}: React.ComponentProps<typeof Label>) {
    return (
        <Label
            data-slot="field-label"
            className={cn(
                'tw:group/field-label tw:peer/field-label tw:flex tw:w-fit tw:gap-2 tw:leading-snug tw:group-data-[disabled=true]/field:opacity-50',
                'tw:has-[>[data-slot=field]]:w-full tw:has-[>[data-slot=field]]:flex-col tw:has-[>[data-slot=field]]:rounded-md tw:has-[>[data-slot=field]]:border tw:[&>*]:data-[slot=field]:p-4',
                'tw:has-data-[state=checked]:bg-primary/5 tw:has-data-[state=checked]:border-primary tw:dark:has-data-[state=checked]:bg-primary/10',
                className
            )}
            {...props}
        />
    );
}

function FieldTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="field-label"
            className={cn(
                'tw:flex tw:w-fit tw:items-center tw:gap-2 tw:text-sm tw:leading-snug tw:font-medium tw:group-data-[disabled=true]/field:opacity-50',
                className
            )}
            {...props}
        />
    );
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
    return (
        <p
            data-slot="field-description"
            className={cn(
                'tw:text-muted-foreground tw:text-sm tw:leading-normal tw:font-normal tw:group-has-[[data-orientation=horizontal]]/field:text-balance',
                'tw:last:mt-0 tw:nth-last-2:-mt-1 tw:[[data-variant=legend]+&]:-mt-1.5',
                'tw:[&>a:hover]:text-primary tw:[&>a]:underline tw:[&>a]:underline-offset-4',
                className
            )}
            {...props}
        />
    );
}

function FieldSeparator({
    children,
    className,
    ...props
}: React.ComponentProps<'div'> & {
    children?: React.ReactNode;
}) {
    return (
        <div
            data-slot="field-separator"
            data-content={!!children}
            className={cn(
                'tw:relative tw:-my-2 tw:h-5 tw:text-sm tw:group-data-[variant=outline]/field-group:-mb-2',
                className
            )}
            {...props}
        >
            <Separator className="tw:absolute tw:inset-0 tw:top-1/2" />
            {children && (
                <span
                    className="tw:bg-background tw:text-muted-foreground tw:relative tw:mx-auto tw:block tw:w-fit tw:px-2"
                    data-slot="field-separator-content"
                >
                    {children}
                </span>
            )}
        </div>
    );
}

function FieldError({
    className,
    children,
    errors,
    ...props
}: React.ComponentProps<'div'> & {
    errors?: Array<{ message?: string } | undefined>;
}) {
    const content = useMemo(() => {
        if (children) {
            return children;
        }

        if (!errors?.length) {
            return null;
        }

        const uniqueErrors = [
            ...new Map(errors.map((error) => [error?.message, error])).values(),
        ];

        if (uniqueErrors?.length == 1) {
            return uniqueErrors[0]?.message;
        }

        return (
            <ul className="tw:ml-4 tw:flex tw:list-disc tw:flex-col tw:gap-1">
                {uniqueErrors.map(
                    (error, index) =>
                        error?.message && <li key={index}>{error.message}</li>
                )}
            </ul>
        );
    }, [children, errors]);

    if (!content) {
        return null;
    }

    return (
        <div
            role="alert"
            data-slot="field-error"
            className={cn(
                'tw:text-destructive tw:text-sm tw:font-normal',
                className
            )}
            {...props}
        >
            {content}
        </div>
    );
}

export {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
    FieldTitle,
};
