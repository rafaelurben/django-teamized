export function handleError(jsondata) {
    if (jsondata.alert) {
        Swal.fire({
            icon: 'error',
            ...jsondata.alert
        })
    } else {
        Swal.fire({
            title: 'Error!',
            text: 'Es ist ein Fehler aufgetreten!',
            icon: 'error',
        })
    }
}
