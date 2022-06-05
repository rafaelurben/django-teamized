// Utils

export function validateUUID(uuid) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export function padZero(num, len) {
    return String(num).padStart(len, "0");
}

export function ms2HoursMinutesSeconds(ms) {
    return {
        hours: padZero(Math.floor(ms / 1000 / 60 / 60), 2),
        minutes: padZero(Math.floor(ms / 1000 / 60) % 60, 2),
        seconds: padZero(Math.floor(ms / 1000) % 60, 2),
    }
}

export function seconds2HoursMinutesSeconds(seconds) {
    return ms2HoursMinutesSeconds(seconds * 1000);
}
