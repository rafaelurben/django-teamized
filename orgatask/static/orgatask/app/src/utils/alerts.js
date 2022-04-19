export function errorAlert(request) {
    console.debug("Error: " + request.status + " " + request.statusText, request.responseJSON);
    let jsondata = request.responseJSON;
    if (jsondata.alert) {
        Swal.fire({
            icon: 'error',
            ...jsondata.alert
        })
    } else {
        Swal.fire({
            title: `Fehler ${request.status}`,
            html: `Es ist ein Fehler aufgetreten:<br><br>${jsondata.message}<br>(error ${jsondata.error})`,
            icon: 'error',
        })
    }
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
    }).then((result) => {
        if (result.value) {
            callback();
        }
    })
}
