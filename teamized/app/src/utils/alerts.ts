/**
 * This file contains presets using the SweetAlert2 library
 * https://sweetalert2.github.io/
 */

import type { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';
import Swal from 'sweetalert2';

import { ErrorResponse } from '../interfaces/responses/errorResponse';
import { SuccessfulResponse } from '../interfaces/responses/successfulResponse';
import { getSwalTheme } from '../service/settings.service';

export { Swal, SweetAlertOptions, SweetAlertResult };

/**
 * Wrapper for Swal.fire() to set the theme
 */
export function fireAlert<T>(options: SweetAlertOptions = {}) {
    return Swal.fire<T>({
        theme: getSwalTheme(),
        ...options,
    });
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

    let alertData: Partial<SweetAlertOptions>;
    if (jsonData.alert) {
        alertData = {
            icon: 'error',
            ...jsonData.alert,
        };
    } else {
        alertData = {
            icon: 'error',
            title: `Uupsie! Es ist ein Fehler aufgetreten`,
            text: jsonData.message,
            footer: `Error-Code: ${jsonData.error}`,
        };
    }

    if (Swal.isVisible() && Swal.isLoading()) {
        // If a Swal is currently shown, show the error as a validation message
        // so that no form data gets lost.
        Swal.showValidationMessage(`${alertData.title} - ${alertData.text}`);
        Swal.hideLoading();
    } else {
        // If no Swal is currently shown, fire a Swal modal.
        return fireAlert(alertData as SweetAlertOptions);
    }
}

/**
 * Create an alert based on successfull ajax request json data
 *
 * @param {object} data
 */
export function apiRequestSuccessAlert(data: SuccessfulResponse) {
    return fireAlert({
        toast: true,
        icon: 'success',
        position: 'top-right',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        ...data.alert,
    } satisfies SweetAlertOptions);
}

// Informational alerts

/**
 * Show a simple error alert
 *
 * @param {String} title
 * @param {String} message
 * @param {object} options
 */
export function errorAlert(
    title: string,
    message: string,
    options: SweetAlertOptions = {}
) {
    return fireAlert({
        title: title,
        html: message,
        icon: 'error',
        ...options,
    } satisfies SweetAlertOptions);
}

/**
 * Show a simple info alert
 *
 * @param {String} title
 * @param {String} message
 * @param {object} options
 */
export function infoAlert(
    title: string,
    message: string,
    options: SweetAlertOptions = {}
) {
    return fireAlert({
        title: title,
        html: message,
        icon: 'info',
        ...options,
    } satisfies SweetAlertOptions);
}

/**
 * Show a simple waiting alert toast (indicating that something is loading)
 *
 * @param {String} text
 * @param {object} options
 */
export function waitingAlert(text: string, options: SweetAlertOptions = {}) {
    return fireAlert({
        title: 'In Bearbeitung...',
        text: text,
        toast: true,
        icon: 'info',
        position: 'top-right',
        showConfirmButton: false,
        ...options,
    } satisfies SweetAlertOptions);
}

/**
 * Show a simple success alert toast
 *
 * @param {String} text
 * @param {String} title
 * @param {object} options
 */
export function successAlert(
    text: string,
    title: string,
    options: SweetAlertOptions = {}
) {
    return fireAlert({
        toast: true,
        icon: 'success',
        position: 'top-right',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        title: title || 'Aktion erfolgreich!',
        text: text,
        ...options,
    } satisfies SweetAlertOptions);
}

// Interactive alerts

/**
 * Create a confirmation alert (action required)
 *
 * @param {*} html content of the alert
 * @param {*} preConfirm function that is called when the user confirms the alert
 * @param {String} title
 * @param {object} options
 * @returns a promise resolving to the SweetAlertResult containing the return value of preConfirm
 */
export async function confirmAlert<T>(
    html: string,
    preConfirm: (() => Promise<T>) | null,
    title: string = '',
    options: SweetAlertOptions = {}
) {
    const data: SweetAlertOptions = {
        theme: getSwalTheme(),
        title: title || 'Sicher?',
        html: html,
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
 * @param {*} html
 * @param {*} preConfirm function that is called when the user confirms the alert twice
 * @returns a promise resolving to the SweetAlertResult containing the return value of preConfirm
 */
export async function doubleConfirmAlert<T>(
    html: string,
    preConfirm: () => Promise<T>
) {
    const firstAlertResult = await confirmAlert<null>(html, null, 'Sicher?');
    if (firstAlertResult.isConfirmed) {
        return await confirmAlert<T>(
            html +
                "<br /><br /><b class='text-danger'>ES GIBT KEIN ZURÜCK!</b>",
            preConfirm,
            'Absolut sicher?'
        );
    } else {
        return firstAlertResult;
    }
}
