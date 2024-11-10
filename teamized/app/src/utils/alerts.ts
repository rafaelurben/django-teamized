/**
 * This file contains presets using the SweetAlert2 library
 * https://sweetalert2.github.io/
 */

import type { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';
import Swal from 'sweetalert2/dist/sweetalert2.js';

import { ErrorResponse } from '../interfaces/responses/errorResponse';
import { SuccessfulResponse } from '../interfaces/responses/successfulResponse';

export { Swal, SweetAlertOptions, SweetAlertResult };

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
        return Swal.fire(alertData as SweetAlertOptions);
    }
}

/**
 * Create an alert based on successfull ajax request json data
 *
 * @param {object} data
 */
export function apiRequestSuccessAlert(data: SuccessfulResponse) {
    return Swal.fire({
        toast: true,
        icon: 'success',
        position: 'top-right',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        ...data.alert,
    } as SweetAlertOptions);
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
    options: Partial<SweetAlertOptions> = {}
) {
    return Swal.fire({
        title: title,
        html: message,
        icon: 'error',
        ...options,
    } as SweetAlertOptions);
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
    options: Partial<SweetAlertOptions> = {}
) {
    return Swal.fire({
        title: title,
        html: message,
        icon: 'info',
        ...options,
    } as SweetAlertOptions);
}

/**
 * Show a simple waiting alert toast (indicating that something is loading)
 *
 * @param {String} text
 * @param {object} options
 */
export function waitingAlert(
    text: string,
    options: Partial<SweetAlertOptions> = {}
) {
    return Swal.fire({
        title: 'In Bearbeitung...',
        text: text,
        toast: true,
        icon: 'info',
        position: 'top-right',
        showConfirmButton: false,
        ...options,
    } as SweetAlertOptions);
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
    options: Partial<SweetAlertOptions> = {}
) {
    return Swal.fire({
        toast: true,
        icon: 'success',
        position: 'top-right',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        title: title || 'Aktion erfolgreich!',
        text: text,
        ...options,
    } as SweetAlertOptions);
}

// Interactive alerts

/**
 * Create a confirmation alert (action required)
 *
 * @param {*} html content of the alert
 * @param {*} preConfirm function that is called when the user confirms the alert
 * @param {String} title
 * @param {object} options
 * @returns the result of the preConfirm function if the user confirmed the alert
 */
export function confirmAlert(
    html: string,
    preConfirm: () => unknown,
    title: string = '',
    options: Partial<SweetAlertOptions> = {}
) {
    return new Promise((resolve, reject) => {
        const data: SweetAlertOptions = {
            title: title || 'Sicher?',
            html: html,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Ja',
            cancelButtonText: 'Nein, abbrechen',
            ...options,
        } as SweetAlertOptions;

        if (preConfirm !== undefined) {
            data.preConfirm = preConfirm;
            data.showLoaderOnConfirm = true;
        }

        Swal.fire(data)
            .then((result) => {
                if (result.isConfirmed) {
                    resolve(result.value);
                }
                // Do not resolve nor reject if dismissed/cancelled
            })
            .catch(reject);
    });
}

/**
 * Same as confirmAlert, but asks twice for confirmation
 *
 * @param {*} html
 * @param {*} preConfirm function that is called when the user confirms the alert twice
 * @returns the result of the preConfirm function if the user confirmed both alerts
 */
export function doubleConfirmAlert(html: string, preConfirm: () => unknown) {
    return new Promise((resolve, reject) => {
        confirmAlert(html, () => {}, 'Sicher?').then(() => {
            confirmAlert(
                html +
                    "<br /><br /><b class='text-danger'>ES GIBT KEIN ZURÜCK!</b>",
                preConfirm,
                'Absolut sicher?'
            ).then(resolve, reject);
        }, reject);
    });
}
