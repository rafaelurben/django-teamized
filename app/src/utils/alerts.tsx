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
 * @param {String} title
 * @param {object} options
 * @returns a promise resolving to the SweetAlertResult containing the return value of preConfirm
 */
export async function confirmAlert<T>(
    content: ReactNode,
    preConfirm: (() => Promise<T>) | null,
    title: string = '',
    options: SweetAlertOptions = {}
) {
    const data: SweetAlertOptions = {
        theme: getSwalTheme(),
        title: title || 'Sicher?',
        html: content as string,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Ja',
        cancelButtonText: 'Nein, abbrechen',
        ...options,
    } satisfies SweetAlertOptions;

    if (preConfirm !== undefined && preConfirm !== null) {
        data.preConfirm = preConfirm;
        data.showLoaderOnConfirm = true;
    }

    return await fireAlert<T>(data);
}

/**
 * Same as confirmAlert, but asks twice for confirmation
 *
 * @param {*} content
 * @param {*} preConfirm function that is called when the user confirms the alert twice
 * @returns a promise resolving to the SweetAlertResult containing the return value of preConfirm
 */
export async function doubleConfirmAlert<T>(
    content: ReactNode,
    preConfirm: () => Promise<T>
) {
    const firstAlertResult = await confirmAlert<null>(content, null, 'Sicher?');
    if (firstAlertResult.isConfirmed) {
        return await confirmAlert<T>(
            <>
                {content}
                <br />
                <br />
                <b className="tw:text-destructive">ES GIBT KEIN ZURÜCK!</b>
            </>,
            preConfirm,
            'Absolut sicher?'
        );
    } else {
        return firstAlertResult;
    }
}
