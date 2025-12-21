import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { CircleIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/shadcn/lib/utils';

function RadioGroup({
    className,
    ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
    return (
        <RadioGroupPrimitive.Root
            data-slot="radio-group"
            className={cn('tw:grid tw:gap-3', className)}
            {...props}
        />
    );
}

function RadioGroupItem({
    className,
    ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
    return (
        <RadioGroupPrimitive.Item
            data-slot="radio-group-item"
            className={cn(
                'tw:border-input tw:text-primary tw:focus-visible:border-ring tw:focus-visible:ring-ring/50 tw:aria-invalid:ring-destructive/20 tw:dark:aria-invalid:ring-destructive/40 tw:aria-invalid:border-destructive tw:dark:bg-input/30 tw:aspect-square tw:size-4 tw:shrink-0 tw:rounded-full tw:border tw:shadow-xs tw:transition-[color,box-shadow] tw:outline-none tw:focus-visible:ring-[3px] tw:disabled:cursor-not-allowed tw:disabled:opacity-50',
                className
            )}
            {...props}
        >
            <RadioGroupPrimitive.Indicator
                data-slot="radio-group-indicator"
                className="tw:relative tw:flex tw:items-center tw:justify-center"
            >
                <CircleIcon className="tw:fill-primary tw:absolute tw:top-1/2 tw:left-1/2 tw:size-2 tw:-translate-x-1/2 tw:-translate-y-1/2" />
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
    );
}

export { RadioGroup, RadioGroupItem };
