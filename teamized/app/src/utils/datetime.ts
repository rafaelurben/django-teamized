/**
 * Datetime utils
 */

import { padZero } from './utils';

// Datetime utils

/**
 * Round a date to the beginning of the day (+ offset days)
 *
 * @param {Date} oldDate
 * @param {Number} offset in days
 * @returns {Date}
 */
export function roundDays(oldDate: Date, offset: number = 0): Date {
    return new Date(
        oldDate.getFullYear(),
        oldDate.getMonth(),
        oldDate.getDate() + offset
    );
}

/**
 * Round a date to the beginning of the month (+ offset months)
 *
 * @param {Date} oldDate
 * @param {Number} offset in months
 * @returns {Date}
 */
export function roundMonths(oldDate: Date, offset: number = 0): Date {
    return new Date(oldDate.getFullYear(), oldDate.getMonth() + offset, 1);
}

/**
 * Checks whether two Date objects are on the same day
 *
 * @param {Date} date1
 * @param {Date} date2
 * @returns {Boolean}
 */
export function isSameDate(date1: Date, date2: Date): boolean {
    return roundDays(date1).getTime() === roundDays(date2).getTime();
}

/**
 * Checks whether a Date object lies between two other Date objects
 *
 * @param {Date} date to check
 * @param {Date} start first possible date
 * @param {Date} end last possible date
 * @returns {Boolean}
 */
export function isInRange(date: Date, start: Date, end: Date): boolean {
    return date >= start && date <= end;
}

/**
 * Get the start of the week (monday 12:00 am) for a given date
 *
 * @param {Date} date
 * @returns {Date}
 */
export function getMondayOfWeek(date: Date): Date {
    const dayOfWeek = (date.getDay() || 7) - 1; // make 0 = monday instead of sunday
    return roundDays(date, -dayOfWeek);
}

/**
 * Get a String representation of a Date object (date only)
 *
 * @param {Date} date
 * @returns {String}
 */
export function getDateString(date: Date): string {
    return date.toLocaleString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/**
 * Get a String representation of a Date object (date and time)
 *
 * @param {Date} datetime
 * @returns {String}
 */
export function getDateTimeString(datetime: Date): string {
    return datetime.toLocaleString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    });
}

/**
 * Get a String representation of a Date object (time only)
 *
 * @param {Date} datetime
 * @returns {String}
 */
export function getTimeString(datetime: Date): string {
    return datetime.toLocaleString(undefined, {
        hour: 'numeric',
        minute: 'numeric',
    });
}

/**
 * Converts a Date or string object into a ISO format string
 *
 * @returns {String}
 */
export function isoFormat(value: Date | string): string {
    if (value === undefined || value === null || value === '') return '';
    return new Date(value).toISOString();
}

/**
 * Convert a Date object into the format used in input fields
 *
 * @param {Date} value
 * @param {Boolean} dateOnly true for date field, false for datetime-local field
 * @returns {String}
 */
export function localInputFormat(
    value: Date | string,
    dateOnly: boolean = false
): string {
    if (value === undefined || value === null || value === '') return '';
    let datetime = new Date(value);
    datetime.setMinutes(datetime.getMinutes() - datetime.getTimezoneOffset());
    let result = datetime.toISOString().substring(0, 16);

    if (dateOnly) return result.split('T')[0];
    return result;
}

/**
 * Convert milliseconds into an object with hours, minutes and seconds
 *
 * @param {Number} ms count of milliseconds
 * @returns {object}
 */
export function ms2HoursMinutesSeconds(ms: number): object {
    return {
        hours: padZero(Math.floor(ms / 1000 / 60 / 60), 2),
        minutes: padZero(Math.floor(ms / 1000 / 60) % 60, 2),
        seconds: padZero(Math.floor(ms / 1000) % 60, 2),
    };
}

/**
 * Convert seconds into an object with hours, minutes and seconds
 *
 * @param {Number} seconds count of seconds
 * @returns {object}
 */
export function seconds2HoursMinutesSeconds(seconds: number): object {
    return ms2HoursMinutesSeconds(seconds * 1000);
}

/**
 *
 * @param {String} birthDateString
 * @returns {Number} age in years
 */
export function getAge(birthDateString: string): number {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate()))
        age--;
    return age;
}
