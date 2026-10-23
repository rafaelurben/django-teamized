/**
 * This file contains presets using the SweetAlert2 library
 * https://sweetalert2.github.io/
 */

import type { ReactNode } from 'react';
import React from 'react';
import { toast } from 'sonner';
import type { SweetAlertOptions as BaseSweetAlertOptions } from 'sweetalert2';
import OrigSwal from 'sweetalert2';
import withReactContent, {
    ReactSweetAlertOptions as SweetAlertOptions,
} from 'sweetalert2-react-content';

import {
    ConfirmDialogOptions,
    ConfirmDialogResult,
    globalConfirm,
} from '@/teamized/components/common/dialogs/confirmDialog';
import { Alert } from '@/teamized/interfaces/responses/alert';
import { ErrorResponse } from '@/teamized/interfaces/responses/errorResponse';
import { getSwalTheme } from '@/teamized/service/settings.service';

export const Swal = withReactContent(OrigSwal);
export { toast } from 'sonner';

/**
 * Wrapper for Swal.fire() to set the theme
 */
export function fireAlert<T>(options: SweetAlertOptions = {}) {
    return Swal.fire<T>({
        theme: getSwalTheme(),
        ...options,
    } as BaseSweetAlertOptions); // due to typing issues with sweetalert2-react-content
}

/**
 * Create an alert based on a failed ajax request
 */
export function apiRequestErrorAlert(request: JQuery.jqXHR) {
    console.debug(`Error: ${request.status} ${request.statusText}`, request);

    let jsonData: ErrorResponse;
    if (Object.hasOwn(request, 'responseJSON')) {
        jsonData = request.responseJSON;
    } else {
        jsonData = {
            error: request.status.toString(),
            message: request.statusText,
        };
    }

    const alertData: Alert = jsonData.alert ?? {
        title: `Es ist ein Fehler aufgetreten (Code ${jsonData.error})`,
        text: jsonData.message,
    };

    if (Swal.isVisible() && Swal.isLoading()) {
        // If a Swal is currently shown, show the error as a validation message
        // so that no form data gets lost.
        Swal.showValidationMessage(`${alertData.title} - ${alertData.text}`);
        Swal.hideLoading();
    } else {
        // If no Swal is currently shown, fire a toast.
        errorToast(alertData.title, alertData.text);
    }
}

// Informational alerts

/**
 * Show a simple error alert toast
 *
 * @param {String} title
 * @param {String} text
 */
export function errorToast(title: string, text: string) {
    toast.error(title, { description: text });
}

/**
 * Show a simple success alert toast
 *
 * @param {String} title
 * @param {String} text
 */
export function successToast(title: string, text: string) {
    toast.success(title, { description: text });
}

/**
 * Show a simple waiting alert toast (indicating that something is loading)
 *
 * @param {String} text
 * @param {Promise<unknown>} promise
 */
export function waitingToast<T>(text: string, promise: Promise<T>) {
    return toast
        .promise(promise, {
            loading: text,
        })
        .unwrap();
}

// Interactive alerts

/**
 * Create a confirmation alert (action required)
 *
 * @param {*} content content of the alert
 * @param {*} preConfirm function that is called when the user confirms the alert
 * @param {object} options
 * @returns a promise resolving to the ConfirmDialogResult containing the return value of preConfirm
 */
export async function confirmAlert<T = unknown>(
    content: ReactNode,
    preConfirm: (() => Promise<T>) | null = null,
    options: Partial<ConfirmDialogOptions<T>> = {}
): Promise<ConfirmDialogResult<T>> {
    return await globalConfirm<T>({
        title: options.title || 'Sicher?',
        description: content,
        confirmButtonText: 'Ja',
        cancelButtonText: 'Nein, abbrechen',
        confirmations: options.confirmations ?? 1,
        requireText: options.requireText,
        preConfirm,
        ...options,
    });
}

/**
 * Same as confirmAlert, but asks twice for confirmation
 *
 * @param {*} content
 * @param {*} preConfirm function that is called when the user confirms the alert twice
 * @param {object} options
 * @returns a promise resolving to the ConfirmDialogResult containing the return value of preConfirm
 */
export async function doubleConfirmAlert<T = unknown>(
    content: ReactNode,
    preConfirm: () => Promise<T>,
    options: Partial<ConfirmDialogOptions<T>> = {}
): Promise<ConfirmDialogResult<T>> {
    return await confirmAlert<T>(content, preConfirm, {
        stepTitles: ['Sicher?', 'Absolut sicher?'],
        stepDescriptions: [
            content,
            <>
                {content}
                <br />
                <br />
                <b className="tw:text-destructive">ES GIBT KEIN ZURÜCK!</b>
            </>,
        ],
        confirmations: 2,
        variant: 'destructive',
        ...options,
    });
}

export {
    type ConfirmDialogOptions,
    ConfirmDialogProvider,
    SweetAlertResult,
} from '@/teamized/components/common/dialogs/confirmDialog';
