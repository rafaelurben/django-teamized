import { padZero } from "./utils.js";

// Datetime utils

export function roundDays(olddate, offset) {
    offset = offset || 0;
    return new Date(olddate.getFullYear(), olddate.getMonth(), olddate.getDate() + offset);
}

export function roundMonths(olddate, offset) {
    offset = offset || 0;
    return new Date(olddate.getFullYear(), olddate.getMonth() + offset, 1);
}

export function isSameDate(date1, date2) {
    return roundDays(date1).getTime() === roundDays(date2).getTime();
}

export function isInRange(date, start, end) {
    return date >= start && date <= end;
}

export function getMondayOfWeek(date) {
    const dayOfWeek = (date.getDay() || 7) - 1; // make 0 = monday instead of sunday
    return roundDays(date, -dayOfWeek);
}

export function getDateString(date) {
    return date.toLocaleString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export function getDateTimeString(datetime) {
    return datetime.toLocaleString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
    });
}

export function getTimeString(datetime) {
    return datetime.toLocaleString(undefined, {
        hour: "numeric",
        minute: "numeric",
    });
}

export function isoFormat(value) {
    if (value === undefined || value === null || value === "") return null;
    return (new Date(value)).toISOString();
}

export function localInputFormat(value, dateOnly) {
    if (value === undefined || value === null || value === "") return null;
    let datetime = new Date(value);
    datetime.setMinutes(datetime.getMinutes() - datetime.getTimezoneOffset());
    let result = datetime.toISOString().substring(0, 16);

    if (dateOnly) return result.split("T")[0];
    return result;
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
