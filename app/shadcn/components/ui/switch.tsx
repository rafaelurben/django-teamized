import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as React from 'react';

import { cn } from '@/shadcn/lib/utils';

function Switch({
    className,
    ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
    return (
        <SwitchPrimitive.Root
            data-slot="switch"
            className={cn(
                'tw:peer tw:data-[state=checked]:bg-primary tw:data-[state=unchecked]:bg-input tw:focus-visible:border-ring tw:focus-visible:ring-ring/50 tw:dark:data-[state=unchecked]:bg-input/80 tw:inline-flex tw:h-[1.15rem] tw:w-8 tw:shrink-0 tw:items-center tw:rounded-full tw:border tw:border-transparent tw:shadow-xs tw:transition-all tw:outline-none tw:focus-visible:ring-[3px] tw:disabled:cursor-not-allowed tw:disabled:opacity-50',
                className
            )}
            {...props}
        >
            <SwitchPrimitive.Thumb
                data-slot="switch-thumb"
                className={cn(
                    'tw:bg-background tw:dark:data-[state=unchecked]:bg-foreground tw:dark:data-[state=checked]:bg-primary-foreground tw:pointer-events-none tw:block tw:size-4 tw:rounded-full tw:ring-0 tw:transition-transform tw:data-[state=checked]:translate-x-[calc(100%-2px)] tw:data-[state=unchecked]:translate-x-0'
                )}
            />
        </SwitchPrimitive.Root>
    );
}

export { Switch };
