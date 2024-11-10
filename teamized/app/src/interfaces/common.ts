/**
 * Common/shared types
 */

/**
 * A UUID.
 */
export type ID = string;
/**
 * A date & time formatted as isoFormat.
 *
 * Example: 2021-07-27T16:02:08.070557
 */
export type DateTimeString = string;
/**
 * A date formatted as isoFormat
 *
 * Example: 2021-07-27
 */
export type DateString = string;

export type IDIndexedObjectList<T> = { [key: ID]: T };
