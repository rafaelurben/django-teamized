import { DynamicIcon, IconName } from 'lucide-react/dynamic';
import React, {
    createContext,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useSyncExternalStore,
} from 'react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from '@/shadcn/components/ui/alert-dialog';
import { Input } from '@/shadcn/components/ui/input';
import { Label } from '@/shadcn/components/ui/label';
import { Spinner } from '@/shadcn/components/ui/spinner';

export type ConfirmDialogOptions<T = unknown> = {
    title: ReactNode;
    description: ReactNode;
    icon?: IconName | null;
    confirmations?: 1 | 2 | 3;
    requireText?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    variant?: 'default' | 'destructive' | 'success' | 'link' | 'info';
    preConfirm?: (() => Promise<T> | T) | null;
    stepTitles?: ReactNode[];
    stepDescriptions?: ReactNode[];
};

export class ConfirmDialogResult<T = unknown> {
    readonly isConfirmed: boolean;
    readonly isDenied: boolean;
    readonly isDismissed: boolean;
    readonly value?: T;

    constructor(isConfirmed: boolean, value?: T) {
        this.isConfirmed = isConfirmed;
        this.isDenied = false;
        this.isDismissed = !isConfirmed;
        this.value = value;
    }
}

export type SweetAlertResult<T = unknown> = ConfirmDialogResult<T>;

export type ConfirmDialogContextValue = {
    confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
};

export const ConfirmDialogContext =
    createContext<ConfirmDialogContextValue | null>(null);

export interface QueuedRequest<T = unknown> {
    id: number;
    options: ConfirmDialogOptions<T>;
    isCustomResult: boolean;
    resolve: (value: boolean | ConfirmDialogResult<T>) => void;
    settled: boolean;
}

export interface ConfirmDialogState {
    activeRequest: QueuedRequest | null;
    currentStep: number;
    totalSteps: number;
    isFinalStep: boolean;
    inputValue: string;
    isLoading: boolean;
    requireText?: string;
    icon: IconName | null;
    isTextMatch: boolean;
    isConfirmDisabled: boolean;
    isDestructive: boolean;
    displayTitle?: ReactNode;
    displayDescription?: ReactNode;
    confirmButtonText: string;
    cancelButtonText: string;
    variant: 'default' | 'destructive' | 'success' | 'link' | 'info';
}

let nextId = 1;

/**
 * Core controller managing dialog state, step progression, input validation,
 * and concurrent request queuing.
 */
export class ConfirmDialogController {
    private activeRequest: QueuedRequest | null = null;
    private readonly queue: QueuedRequest[] = [];
    private currentStep = 1;
    private inputValue = '';
    private isLoading = false;
    private readonly listeners = new Set<() => void>();
    private isMounted = false;
    private state: ConfirmDialogState;

    constructor() {
        this.state = this.computeState();
    }

    private computeState(): ConfirmDialogState {
        const options = this.activeRequest?.options;

        const totalSteps = options?.confirmations ?? 1;
        const isFinalStep = this.currentStep === totalSteps;
        const requireText = options?.requireText;
        const isTextMatch = !requireText || this.inputValue === requireText;
        const isConfirmDisabled =
            (isFinalStep && !isTextMatch) || this.isLoading;
        const isDestructive = options?.variant === 'destructive';

        const icon = options?.icon || (isDestructive ? 'trash-2' : null);

        return {
            activeRequest: this.activeRequest,
            currentStep: this.currentStep,
            totalSteps,
            isFinalStep,
            inputValue: this.inputValue,
            isLoading: this.isLoading,
            requireText,
            icon,
            isTextMatch,
            isConfirmDisabled,
            isDestructive,
            displayTitle:
                options?.stepTitles?.[this.currentStep - 1] ?? options?.title,
            displayDescription:
                options?.stepDescriptions?.[this.currentStep - 1] ??
                options?.description,
            confirmButtonText:
                options?.confirmButtonText ??
                (isFinalStep ? 'Bestätigen' : 'Weiter'),
            cancelButtonText: options?.cancelButtonText ?? 'Abbrechen',
            variant: options?.variant ?? 'default',
        };
    }

    private notify() {
        this.state = this.computeState();
        for (const listener of this.listeners) {
            listener();
        }
    }

    public subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    };

    public getState = (): ConfirmDialogState => {
        return this.state;
    };

    private settleRequest(
        request: QueuedRequest,
        resolution: boolean | ConfirmDialogResult<unknown>
    ) {
        if (!request.settled) {
            request.settled = true;
            request.resolve(resolution);
        }
    }

    private activateRequest(request: QueuedRequest) {
        this.activeRequest = request;
        this.currentStep = 1;
        this.inputValue = '';
        this.isLoading = false;
        this.notify();
    }

    private completeActiveRequest(
        resolution: boolean | ConfirmDialogResult<unknown>
    ) {
        const current = this.activeRequest;
        if (current) {
            this.settleRequest(current, resolution);
        }

        if (this.queue.length > 0) {
            const nextRequest = this.queue.shift()!;
            this.activateRequest(nextRequest);
        } else {
            this.activeRequest = null;
            this.currentStep = 1;
            this.inputValue = '';
            this.isLoading = false;
            this.notify();
        }
    }

    public dispatchRequest = <T,>(
        options: ConfirmDialogOptions<T>,
        isCustomResult: boolean
    ): Promise<boolean | ConfirmDialogResult<T>> => {
        return new Promise<boolean | ConfirmDialogResult<T>>((resolve) => {
            const request: QueuedRequest<T> = {
                id: nextId++,
                options,
                isCustomResult,
                resolve,
                settled: false,
            };

            if (this.activeRequest === null) {
                this.activateRequest(request as QueuedRequest<unknown>);
            } else {
                this.queue.push(request as QueuedRequest<unknown>);
            }
        });
    };

    public confirm = (options: ConfirmDialogOptions): Promise<boolean> => {
        return this.dispatchRequest(options, false) as Promise<boolean>;
    };

    public confirmCustom = <T,>(
        options: ConfirmDialogOptions<T>
    ): Promise<ConfirmDialogResult<T>> => {
        return this.dispatchRequest(options, true) as Promise<
            ConfirmDialogResult<T>
        >;
    };

    public setInputValue = (value: string) => {
        this.inputValue = value;
        this.notify();
    };

    public handleConfirm = async (): Promise<void> => {
        const current = this.activeRequest;
        if (!current || this.isLoading) return;

        const maxSteps = current.options.confirmations ?? 1;
        if (this.currentStep < maxSteps) {
            // Intermediate confirmation: advance step without resolving
            this.currentStep += 1;
            this.notify();
            return;
        }

        // Final confirmation
        if (
            current.options.requireText &&
            this.inputValue !== current.options.requireText
        ) {
            return;
        }

        if (current.options.preConfirm) {
            this.isLoading = true;
            this.notify();
            try {
                const result = await current.options.preConfirm();
                this.completeActiveRequest(
                    current.isCustomResult
                        ? new ConfirmDialogResult(true, result)
                        : true
                );
            } catch (err) {
                this.isLoading = false;
                this.notify();
                console.error('Confirm dialog preConfirm error:', err);
            }
        } else {
            this.completeActiveRequest(
                current.isCustomResult ? new ConfirmDialogResult(true) : true
            );
        }
    };

    public handleCancel = (): void => {
        if (this.isLoading) return;
        const current = this.activeRequest;
        this.completeActiveRequest(
            current?.isCustomResult ? new ConfirmDialogResult(false) : false
        );
    };

    public mount = () => {
        this.isMounted = true;
    };

    public unmount = (): void => {
        this.isMounted = false;
        let changed = false;
        if (this.activeRequest) {
            this.settleRequest(
                this.activeRequest,
                this.activeRequest.isCustomResult
                    ? new ConfirmDialogResult(false)
                    : false
            );
            this.activeRequest = null;
            changed = true;
        }

        while (this.queue.length > 0) {
            const req = this.queue.shift()!;
            this.settleRequest(
                req,
                req.isCustomResult ? new ConfirmDialogResult(false) : false
            );
            changed = true;
        }

        if (
            changed ||
            this.currentStep !== 1 ||
            this.inputValue !== '' ||
            this.isLoading
        ) {
            this.currentStep = 1;
            this.inputValue = '';
            this.isLoading = false;
            this.notify();
        }
    };

    public getQueueLength = (): number => {
        return this.queue.length;
    };

    public getIsMounted = (): boolean => {
        return this.isMounted;
    };
}

export const defaultConfirmDialogController = new ConfirmDialogController();

/**
 * Global confirm function accessible outside of React components.
 */
export function globalConfirm<T = unknown>(
    options: ConfirmDialogOptions<T>,
    isCustomResult = true
): Promise<ConfirmDialogResult<T>> {
    return defaultConfirmDialogController.dispatchRequest(
        options,
        isCustomResult
    ) as Promise<ConfirmDialogResult<T>>;
}

export function ConfirmDialogProvider({
    children,
    controller = defaultConfirmDialogController,
}: Readonly<{
    children: ReactNode;
    controller?: ConfirmDialogController;
}>) {
    const state = useSyncExternalStore(
        controller.subscribe,
        controller.getState
    );
    const controllerRef = useRef(controller);
    controllerRef.current = controller;

    useEffect(() => {
        const c = controllerRef.current;
        c.mount();
        return () => {
            c.unmount();
        };
    }, []);

    const confirm = useCallback(
        (options: ConfirmDialogOptions): Promise<boolean> => {
            return controllerRef.current.confirm(options);
        },
        []
    );

    const contextValue = useMemo(() => ({ confirm }), [confirm]);

    return (
        <ConfirmDialogContext.Provider value={contextValue}>
            {children}
            <AlertDialog
                open={state.activeRequest !== null}
                onOpenChange={(open) => {
                    if (!open && !state.isLoading) {
                        controller.handleCancel();
                    }
                }}
            >
                {state.activeRequest && (
                    <AlertDialogContent
                        onEscapeKeyDown={(e) => {
                            if (state.isLoading) {
                                e.preventDefault();
                            }
                        }}
                    >
                        <AlertDialogHeader>
                            {state.icon !== null && (
                                <AlertDialogMedia
                                    className={
                                        state.isDestructive
                                            ? 'tw:bg-destructive/10 tw:text-destructive tw:dark:bg-destructive/20 tw:dark:text-destructive bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive'
                                            : undefined
                                    }
                                >
                                    <DynamicIcon name={state.icon} />
                                </AlertDialogMedia>
                            )}
                            <AlertDialogTitle>
                                {state.displayTitle}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {state.totalSteps > 1 && (
                                    <span
                                        data-slot="confirm-dialog-step-indicator"
                                        className="tw:flex tw:text-xs tw:font-semibold tw:uppercase tw:tracking-wider tw:text-muted-foreground"
                                    >
                                        Bestätigung {state.currentStep} von{' '}
                                        {state.totalSteps}
                                    </span>
                                )}
                                {state.displayDescription}
                                {state.isFinalStep &&
                                    Boolean(state.requireText) && (
                                        <span className="tw:flex tw:flex-col tw:gap-2 tw:py-2 tw:text-left">
                                            <Label
                                                htmlFor="confirm-dialog-text-input"
                                                className="tw:text-sm tw:font-medium"
                                            >
                                                Tippe{' '}
                                                <span className="tw:font-mono tw:font-bold tw:select-all tw:text-foreground">
                                                    {state.requireText}
                                                </span>{' '}
                                                zum Bestätigen:
                                            </Label>
                                            <Input
                                                id="confirm-dialog-text-input"
                                                data-testid="confirm-dialog-text-input"
                                                type="text"
                                                value={state.inputValue}
                                                onChange={(e) =>
                                                    controller.setInputValue(
                                                        e.target.value
                                                    )
                                                }
                                                disabled={state.isLoading}
                                                autoFocus
                                                autoComplete="off"
                                                aria-label={`Type ${state.requireText} to confirm`}
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === 'Enter' &&
                                                        state.isTextMatch &&
                                                        !state.isLoading
                                                    ) {
                                                        e.preventDefault();
                                                        void controller.handleConfirm();
                                                    }
                                                }}
                                            />
                                        </span>
                                    )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                type="button"
                                onClick={() => controller.handleCancel()}
                                disabled={state.isLoading}
                            >
                                {state.cancelButtonText}
                            </AlertDialogCancel>
                            <AlertDialogAction
                                type="button"
                                variant={state.variant}
                                onClick={(e) => {
                                    e.preventDefault();
                                    void controller.handleConfirm();
                                }}
                                disabled={state.isConfirmDisabled}
                            >
                                {state.isLoading && (
                                    <Spinner className="tw:mr-2" />
                                )}
                                {state.confirmButtonText}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                )}
            </AlertDialog>
        </ConfirmDialogContext.Provider>
    );
}
