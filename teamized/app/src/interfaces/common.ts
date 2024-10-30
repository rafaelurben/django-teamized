/**
 * Common/shared types
 */

export type ID = string;
export type DateTimeString = string;
export type DateString = string;

export type IDIndexedObjectList<T> = { [key: ID]: T };
