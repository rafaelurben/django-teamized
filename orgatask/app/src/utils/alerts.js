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

export async function confirmAlert(html, callback, title, options) {
    return await Swal.fire({
        title: title || "Sicher?",
        html: html,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Ja",
        cancelButtonText: "Nein, abbrechen",
        showLoaderOnConfirm: true,
        preConfirm: callback,
        ...options
    })
}

export async function doubleConfirmAlert(html, callback) {
    return await confirmAlert(html, async () => {
        return await confirmAlert(html+"<br /><br /><b class='text-danger'>ES GIBT KEIN ZURÜCK!</b>", callback, "Absolut sicher?")
    });
}
