export function requestErrorAlert(request) {
    console.debug("Error: " + request.status + " " + request.statusText, request);
    let jsondata;

    if (request.hasOwnProperty("responseJSON")) {
        jsondata = request.responseJSON;
    } else {
        jsondata = {
            message: request.statusText,
            error: request.status,
        };
    }

    if (jsondata.alert) {
        Swal.fire({
            icon: 'error',
            ...jsondata.alert
        })
    } else {
        Swal.fire({
            title: `Uupsie!`,
            html: `Es ist ein Fehler aufgetreten:<br><br>${jsondata.message}<br>(error ${jsondata.error})`,
            icon: 'error',
        })
    }
}

export function errorAlert(title, message) {
    Swal.fire({
        title: title,
        html: message,
        icon: 'error',
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

export function successAlert(data) {
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

export function confirmAlert(text, callback) {
    Swal.fire({
        title: "Sicher?",
        text: text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Ja",
        cancelButtonText: "Nein, abbrechen",
        showLoaderOnConfirm: true,
        preConfirm: callback,
    })
}
