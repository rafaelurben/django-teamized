export function handleError(request) {
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
