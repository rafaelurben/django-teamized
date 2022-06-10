// Request reactions

export function requestErrorAlert(request) {
    console.debug("Error: " + request.status + " " + request.statusText, request);
    let jsondata;
    let alertdata;

    if (request.hasOwnProperty("responseJSON")) {
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
            ...jsondata.alert
        }
    } else {
        alertdata = {
            title: `Uupsie!`,
            html: `Es ist ein Fehler aufgetreten:<br><br>${jsondata.message}<br>(error ${jsondata.error})`,
            icon: 'error',
        }
    }
    Swal.fire(alertdata);
    // TODO: [BUG] This can show [object Object] instead of the error message - why though?
}

export function requestSuccessAlert(data) {
    Swal.fire({
        toast: true,
        icon: "success",
        position: 'top-right',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        ...data.alert
    })
}

// Informational alerts

export function errorAlert(title, message, options) {
    Swal.fire({
        title: title,
        html: message,
        icon: 'error',
        ...options
    })
}

export function infoAlert(title, message, options) {
    Swal.fire({
        title: title,
        html: message,
        icon: 'info',
        ...options
    })
}

export function waitingAlert(text, options) {
    Swal.fire({
        title: "In Bearbeitung...",
        text: text,
        toast: true,
        icon: "info",
        position: 'top-right',
        showConfirmButton: false,
        ...options
    })
}

export function successAlert(text, title, options) {
    Swal.fire({
        toast: true,
        icon: "success",
        position: 'top-right',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        title: title || "Aktion erfolgreich!",
        text: text,
        ...options
    })
}

// Interactive alerts

export function confirmAlert(html, preConfirm, title, options) {
    return new Promise((resolve, reject) => {  
        let data = {
            title: title || "Sicher?",
            html: html,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Ja",
            cancelButtonText: "Nein, abbrechen",
            ...options
        }

        if (preConfirm !== undefined) {
            data.preConfirm = preConfirm;
            data.showLoaderOnConfirm = true;
        }

        Swal.fire(data).then((result) => {
            if (result.isConfirmed) {
                resolve(result.value);
            } else {
                reject(result.dismiss);
            }
        });
    });
}

export function doubleConfirmAlert(html, preConfirm) {
    return new Promise((resolve, reject) => {
        confirmAlert(html, undefined, "Sicher?").then(() => {
            confirmAlert(html + "<br /><br /><b class='text-danger'>ES GIBT KEIN ZURÜCK!</b>", preConfirm, "Absolut sicher?").then(resolve, reject)
        }, reject)
    });
}
