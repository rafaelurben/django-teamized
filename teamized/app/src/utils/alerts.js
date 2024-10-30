/**
 * This file contains presets using the SweetAlert2 library
 * https://sweetalert2.github.io/
 */

import Swal, { SweetAlertOptions } from 'sweetalert2/dist/sweetalert2';

export { Swal, SweetAlertOptions };

/**
 * Create an alert based on a failed ajax request
 *
 * @param {jqXHR} request
 */
export function ajaxRequestErrorAlert(request) {
    console.debug(
        'Error: ' + request.status + ' ' + request.statusText,
        request
    );
    let jsondata;
    let alertdata;

    if (request.hasOwnProperty('responseJSON')) {
        jsondata = request.responseJSON;
    } else {
        jsondata = {
            message: request.statusText,
            error: request.status,
        };
    }

    if (jsondata.alert) {
        alertdata = {
            icon: 'error',
            ...jsondata.alert,
        };
    } else {
        alertdata = {
            icon: 'error',
            title: `Uupsie! Es ist ein Fehler aufgetreten`,
            text: jsondata.message,
            footer: `Error-Code: ${jsondata.error}`,
        };
    }

    if (Swal.isVisible() && Swal.isLoading()) {
        // If a Swal is currently shown, show the error as a validation message
        // so that no form data gets lost.
        Swal.showValidationMessage(`${alertdata.title} - ${alertdata.text}`);
        Swal.hideLoading();
    } else {
        // If no Swal is currently shown, fire a Swal modal.
        Swal.fire(alertdata);
    }
}

/**
 * Create an alert based on successfull ajax request json data
 *
 * @param {object} data
 */
export function requestSuccessAlert(data) {
    Swal.fire({
        toast: true,
        icon: 'success',
        position: 'top-right',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        ...data.alert,
    });
}

// Informational alerts

/**
 * Show a simple error alert
 *
 * @param {String} title
 * @param {String} message
 * @param {object} options
 */
export function errorAlert(title, message, options) {
    Swal.fire({
        title: title,
        html: message,
        icon: 'error',
        ...options,
    });
}

/**
 * Show a simple info alert
 *
 * @param {String} title
 * @param {String} message
 * @param {object} options
 */
export function infoAlert(title, message, options) {
    Swal.fire({
        title: title,
        html: message,
        icon: 'info',
        ...options,
    });
}

/**
 * Show a simple waiting alert toast (indicating that something is loading)
 *
 * @param {String} text
 * @param {object} options
 */
export function waitingAlert(text, options) {
    Swal.fire({
        title: 'In Bearbeitung...',
        text: text,
        toast: true,
        icon: 'info',
        position: 'top-right',
        showConfirmButton: false,
        ...options,
    });
}

/**
 * Show a simple success alert toast
 *
 * @param {String} title
 * @param {String} message
 * @param {object} options
 */
export function successAlert(text, title, options) {
    Swal.fire({
        toast: true,
        icon: 'success',
        position: 'top-right',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        title: title || 'Aktion erfolgreich!',
        text: text,
        ...options,
    });
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
export function confirmAlert(html, preConfirm, title = '', options = {}) {
    return new Promise((resolve, reject) => {
        let data = {
            title: title || 'Sicher?',
            html: html,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Ja',
            cancelButtonText: 'Nein, abbrechen',
            ...options,
        };

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
export function doubleConfirmAlert(html, preConfirm) {
    return new Promise((resolve, reject) => {
        confirmAlert(html, undefined, 'Sicher?').then(() => {
            confirmAlert(
                html +
                    "<br /><br /><b class='text-danger'>ES GIBT KEIN ZURÜCK!</b>",
                preConfirm,
                'Absolut sicher?'
            ).then(resolve, reject);
        }, reject);
    });
}
