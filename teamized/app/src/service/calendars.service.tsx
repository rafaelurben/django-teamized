/**
 * Functions used in the calendar module
 */

import $ from 'jquery';
import React from 'react';

import { Button } from '@/shadcn/components/ui/button';

import * as CalendarAPI from '../api/calendar';
import { CacheCategory } from '../interfaces/cache/cacheCategory';
import { Calendar, CalendarRequestDTO } from '../interfaces/calendar/calendar';
import {
    CalendarEvent,
    CalendarEventRequestDTO,
} from '../interfaces/calendar/calendarEvent';
import { ID, IDIndexedObjectList } from '../interfaces/common';
import { Team } from '../interfaces/teams/team';
import {
    confirmAlert,
    doubleConfirmAlert,
    fireAlert,
    Swal,
} from '../utils/alerts';
import {
    getDateString,
    getTimeString,
    isInRange,
    isoFormat,
    isSameDate,
    localInputFormat,
    roundDays,
} from '../utils/datetime';
import * as CacheService from './cache.service';

// Reexport so that datetime.js functions can also be imported from calendars.js
export * from '../utils/datetime';

// Calendar utils

/**
 * Check whether a date is during an event
 *
 * @param {Date} date
 * @param {object} evt the event object
 * @returns {Boolean}
 */
export function isDateInEvent(date: Date, evt: CalendarEvent): boolean {
    let evtStart: Date;
    let evtEnd: Date;
    if (evt.fullday) {
        // roundDays() for full-day events is used to avoid issues with timezones
        evtStart = roundDays(new Date(evt.dstart));
        evtEnd = roundDays(new Date(evt.dend));
    } else {
        evtStart = roundDays(new Date(evt.dtstart));
        evtEnd = new Date(evt.dtend);
    }
    return isInRange(date, evtStart, evtEnd);
}

/**
 * Flattens an object of calendars into a map of events
 * (e.g. merge events from all calendars into a single map)
 *
 * @param {Array} calendars
 * @returns {object}
 */
export function flattenCalendarEvents(
    calendars: Calendar[]
): IDIndexedObjectList<CalendarEvent> {
    const events: IDIndexedObjectList<CalendarEvent> = {};
    Object.values(calendars).forEach((calendar) => {
        Object.values(calendar.events).forEach((evt) => {
            events[evt.id] = {
                ...evt,
                calendar: calendar,
            };
        });
    });
    return events;
}

/**
 * Filter an array of events by a date
 *
 * @param {Array} events
 * @param {Date} date
 */
export function filterCalendarEventsByDate(
    events: CalendarEvent[],
    date: Date
): CalendarEvent[] {
    return events.filter((event) => {
        return isDateInEvent(date, event);
    });
}

/**
 * Sort an array of calendar events.
 *
 * @param events
 * @returns a new sorted array.
 */
export function sortCalendarEvents(events: CalendarEvent[]) {
    return events.toSorted((a, b) => {
        if (a.fullday && b.fullday) {
            return new Date(a.dstart).getTime() - new Date(b.dstart).getTime();
        } else if (!a.fullday && !b.fullday) {
            return (
                new Date(a.dtstart).getTime() - new Date(b.dtstart).getTime()
            );
        } else if (a.fullday) {
            return -1;
        } else {
            return 1;
        }
    });
}

/**
 * Get a display string for an event's date/time based on a selected date.
 *
 * @param event the event object
 * @param selectedDate the selected date
 * @returns {string}
 */
export function getEventDateDisplay(
    event: CalendarEvent,
    selectedDate?: Date
): string {
    const daystart = roundDays(selectedDate || new Date());
    const dayend = roundDays(selectedDate || new Date(), 1);

    if (event.fullday) {
        const evtStart = new Date(event.dstart);
        const evtEnd = new Date(event.dend);
        const sameDayStart = isSameDate(daystart, evtStart);
        const sameDayEnd = isSameDate(daystart, evtEnd);

        if (sameDayStart && sameDayEnd) {
            return 'Ganztägig';
        } else {
            return (
                'Vom ' +
                getDateString(evtStart) +
                ' bis am ' +
                getDateString(evtEnd)
            );
        }
    } else {
        const evtStart = new Date(event.dtstart);
        const evtEnd = new Date(event.dtend);
        const sameDayStart = evtStart.getTime() >= daystart.getTime();
        const sameDayEnd = evtEnd.getTime() < dayend.getTime();

        if (sameDayStart && sameDayEnd) {
            return (
                'Von ' +
                getTimeString(evtStart) +
                ' bis ' +
                getTimeString(evtEnd) +
                ' Uhr'
            );
        } else if (sameDayStart) {
            return 'Ab ' + getTimeString(evtStart) + ' Uhr';
        } else if (sameDayEnd) {
            return 'Bis ' + getTimeString(evtEnd) + ' Uhr';
        } else {
            return 'Ganztägig';
        }
    }
}

// Calendar list

export async function getCalendars(teamId: ID) {
    return await CacheService.refreshTeamCacheCategory(
        teamId,
        CacheCategory.CALENDARS
    );
}

// Calendar creation

export async function createCalendar(teamId: ID, calendar: CalendarRequestDTO) {
    return await CalendarAPI.createCalendar(teamId, calendar).then((data) => {
        CacheService.getTeamData(teamId).calendars[data.calendar.id] =
            data.calendar;
        return data.calendar;
    });
}

export async function createCalendarPopup(team: Team) {
    return await fireAlert<Calendar>({
        title: `Kalender erstellen`,
        html: (
            <>
                <p>Team: {team.name}</p>
                <hr className="tw:my-2" />
                <label className="swal2-input-label" htmlFor="swal-input-name">
                    Name:
                </label>
                <input
                    type="text"
                    id="swal-input-name"
                    className="swal2-input"
                    placeholder="Kalendername"
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-description"
                >
                    Beschreibung:
                </label>
                <textarea
                    id="swal-input-description"
                    className="swal2-textarea"
                    placeholder="Kalenderbeschreibung"
                ></textarea>
                <label className="swal2-input-label" htmlFor="swal-input-color">
                    Farbe:
                </label>
                <input
                    type="color"
                    id="swal-input-color"
                    className="swal2-input tw:cursor-pointer tw:p-0!"
                />
            </>
        ),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Erstellen',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const name = (
                document.getElementById('swal-input-name') as HTMLInputElement
            ).value;
            const description = (
                document.getElementById(
                    'swal-input-description'
                ) as HTMLTextAreaElement
            ).value;
            const color = (
                document.getElementById('swal-input-color') as HTMLInputElement
            ).value;

            if (!name) {
                Swal.showValidationMessage('Bitte gib einen Namen ein');
                return false;
            }

            Swal.showLoading();
            return await createCalendar(team.id, {
                name,
                description,
                color,
            });
        },
    });
}

// Calendar edit

export async function editCalendar(
    teamId: ID,
    calendarId: ID,
    calendar: CalendarRequestDTO
) {
    return await CalendarAPI.updateCalendar(teamId, calendarId, calendar).then(
        (data) => {
            CacheService.getTeamData(teamId).calendars[data.calendar.id] =
                data.calendar;
            return data.calendar;
        }
    );
}

export async function editCalendarPopup(team: Team, calendar: Calendar) {
    return await fireAlert<Calendar>({
        title: `Kalender bearbeiten`,
        html: (
            <>
                <p>Team: {team.name}</p>
                <hr className="tw:my-2" />
                <label className="swal2-input-label" htmlFor="swal-input-name">
                    Name:
                </label>
                <input
                    type="text"
                    id="swal-input-name"
                    className="swal2-input"
                    placeholder={calendar.name}
                    defaultValue={calendar.name}
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-description"
                >
                    Beschreibung:
                </label>
                <textarea
                    id="swal-input-description"
                    className="swal2-textarea"
                    placeholder={calendar.description}
                    defaultValue={calendar.description}
                />
                <label className="swal2-input-label" htmlFor="swal-input-color">
                    Farbe:
                </label>
                <input
                    type="color"
                    id="swal-input-color"
                    className="swal2-input tw:cursor-pointer tw:p-0!"
                    defaultValue={calendar.color}
                />
            </>
        ),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Speichern',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const name = (
                document.getElementById('swal-input-name') as HTMLInputElement
            ).value;
            const description = (
                document.getElementById(
                    'swal-input-description'
                ) as HTMLTextAreaElement
            ).value;
            const color = (
                document.getElementById('swal-input-color') as HTMLInputElement
            ).value;

            if (!name) {
                Swal.showValidationMessage('Bitte gib einen Namen ein!');
                return false;
            }

            Swal.showLoading();
            return await editCalendar(team.id, calendar.id, {
                name,
                description,
                color,
            });
        },
    });
}

// Calendar deletion

export async function deleteCalendar(teamId: ID, calendarId: ID) {
    return await CalendarAPI.deleteCalendar(teamId, calendarId).then(() => {
        delete CacheService.getTeamData(teamId).calendars[calendarId];
    });
}

export async function deleteCalendarPopup(team: Team, calendar: Calendar) {
    return await doubleConfirmAlert(
        <>
            Willst du folgenden Kalender wirklich löschen?
            <br />
            <br />
            <b>Name:</b> {calendar.name} <br />
            <b>Beschreibung: </b> {calendar.description} <br />
            <b>Anzahl Events: </b> {Object.keys(calendar.events).length}
        </>,
        async () => await deleteCalendar(team.id, calendar.id)
    );
}

// Calendar subscription

export async function showCalendarSubscriptionPopup(calendar: Calendar) {
    const urlHTTP = calendar.ics_url;
    const urlWebcal = 'webcal://' + urlHTTP.split('//')[1];

    fireAlert({
        title: 'Kalender abonnieren',
        html: (
            <>
                <p>
                    Um den Kalender zu abonnieren, hast du zwei Möglichkeiten:
                </p>
                <hr className="tw:my-2" />
                <h5 className="tw:text-lg">1) Webcal-Link</h5>
                <p>
                    Auf allen Apple-Geräten sowie weiteren unterstützten Geräten
                    kannst du Webcal-Links direkt in deiner Kalender-App öffnen.
                    Bei manchen anderen Apps (z. B. Google Calendar) musst du
                    den Link kopieren und manuell einfügen.
                </p>
                <Button asChild variant="info">
                    <a href={urlWebcal} target="_blank" rel="noreferrer">
                        Webcal-URL
                    </a>
                </Button>
                <hr className="tw:my-2" />
                <h5 className="tw:text-lg">2) HTTP(S)-Link</h5>
                <p>
                    Falls dein Gerät oder deine App Webcal-Links nicht
                    unterstützt, kannst du auch folgenden Link verwenden. Füge
                    diesen im &#34;Kalender abonnieren&#34;-Dialog (o. ä.)
                    deiner Kalenderapp ein.
                </p>
                <input
                    className="swal2-input"
                    type="url"
                    readOnly
                    defaultValue={urlHTTP}
                />
            </>
        ),
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonText: 'Schliessen',
    });
}

// Event SWAL utils

function _updateFullDayToggle(noDateUpdate: boolean = false) {
    const fullDay = $('#swal-input-fullday').prop('checked') as boolean;
    if (fullDay) {
        $('.fullday-only').show();
        $('.partday-only').hide();
        if (!noDateUpdate) {
            $('#swal-input-dstart').val(
                localInputFormat($('#swal-input-dtstart').val() as string, true)
            );
            $('#swal-input-dend').val(
                localInputFormat($('#swal-input-dtend').val() as string, true)
            );
        }
    } else {
        $('.fullday-only').hide();
        $('.partday-only').show();
        if (!noDateUpdate) {
            $('#swal-input-dtstart').val(
                localInputFormat(
                    isoFormat($('#swal-input-dstart').val() as string),
                    false
                )
            );
            $('#swal-input-dtend').val(
                localInputFormat(
                    isoFormat($('#swal-input-dend').val() as string),
                    false
                )
            );
        }
    }
}

async function generalizedEventPopup({
    team,
    prefilledEvent,
    calendars,
    selectedCalendarId,
    titleText,
    confirmButtonText,
    action,
}: {
    team: Team;
    prefilledEvent: CalendarEvent;
    calendars: Calendar[];
    selectedCalendarId: ID;
    titleText: string;
    confirmButtonText: string;
    action: (
        calendarId: ID,
        e: CalendarEventRequestDTO
    ) => Promise<CalendarEvent>;
}) {
    let dstart: string = '';
    let dend: string = '';
    let dtstart: string = '';
    let dtend: string = '';

    if (prefilledEvent.fullday) {
        dstart = localInputFormat(prefilledEvent.dstart, true);
        dend = localInputFormat(prefilledEvent.dend, true);
    } else {
        dtstart = localInputFormat(prefilledEvent.dtstart);
        dtend = localInputFormat(prefilledEvent.dtend);
    }

    return await fireAlert<CalendarEvent>({
        title: titleText,
        html: (
            <>
                <p>Team: {team.name}</p>
                <hr className="tw:my-2" />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-calendar"
                >
                    Kalender:
                </label>
                <select
                    id="swal-input-calendar"
                    className="swal2-input swal2-select"
                    defaultValue={selectedCalendarId}
                >
                    {calendars.map((calendar) => (
                        <option key={calendar.id} value={calendar.id}>
                            {calendar.name}
                        </option>
                    ))}
                </select>
                <hr className="tw:my-2" />
                <label className="swal2-input-label" htmlFor="swal-input-name">
                    Name:
                </label>
                <input
                    type="text"
                    id="swal-input-name"
                    className="swal2-input"
                    placeholder={prefilledEvent.name}
                    defaultValue={prefilledEvent.name}
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-description"
                >
                    Beschreibung:
                </label>
                <textarea
                    id="swal-input-description"
                    className="swal2-textarea"
                    placeholder={prefilledEvent.description}
                    defaultValue={prefilledEvent.description}
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-location"
                >
                    Ort:
                </label>
                <input
                    type="text"
                    id="swal-input-location"
                    className="swal2-input"
                    placeholder={prefilledEvent.location}
                    defaultValue={prefilledEvent.location}
                />
                <label
                    htmlFor="swal-input-fullday"
                    className="swal2-checkbox tw:flex"
                >
                    <input
                        type="checkbox"
                        id="swal-input-fullday"
                        defaultChecked={prefilledEvent.fullday}
                    />
                    <span className="swal2-label">Ganztägig</span>
                </label>
                <hr className="tw:my-2" />
                <label
                    className="swal2-input-label fullday-only"
                    htmlFor="swal-input-dstart"
                >
                    Von:
                </label>
                <input
                    type="date"
                    id="swal-input-dstart"
                    className="swal2-input fullday-only"
                    defaultValue={dstart}
                />
                <label
                    className="swal2-input-label fullday-only"
                    htmlFor="swal-input-dend"
                >
                    Bis:
                </label>
                <input
                    type="date"
                    id="swal-input-dend"
                    className="swal2-input fullday-only"
                    defaultValue={dend}
                />
                <label
                    className="swal2-input-label partday-only"
                    htmlFor="swal-input-dtstart"
                >
                    Von:
                </label>
                <input
                    type="datetime-local"
                    id="swal-input-dtstart"
                    className="swal2-input partday-only"
                    defaultValue={dtstart}
                />
                <label
                    className="swal2-input-label partday-only"
                    htmlFor="swal-input-dtend"
                >
                    Bis:
                </label>
                <input
                    type="datetime-local"
                    id="swal-input-dtend"
                    className="swal2-input partday-only"
                    defaultValue={dtend}
                />
            </>
        ),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: confirmButtonText,
        cancelButtonText: 'Abbrechen',
        didOpen: () => {
            _updateFullDayToggle(true);
            $('#swal-input-fullday').on('change', () => _updateFullDayToggle());
        },
        preConfirm: async () => {
            const calendarId = $('#swal-input-calendar').val() as ID;
            const name = $('#swal-input-name').val() as string;
            const description = $('#swal-input-description').val() as string;
            const location = $('#swal-input-location').val() as string;
            const fullday = $('#swal-input-fullday').prop('checked') as boolean;

            if (!name) {
                Swal.showValidationMessage('Es wird ein Name benötigt!');
                return false;
            }

            if (fullday) {
                const dstart = $('#swal-input-dstart').val() as string;
                const dend = $('#swal-input-dend').val() as string;

                if (!dstart || !dend) {
                    Swal.showValidationMessage(
                        'Start- und Enddatum sind Pflichtfelder!'
                    );
                    return false;
                }
                if (new Date(dstart) > new Date(dend)) {
                    Swal.showValidationMessage(
                        'Startdatum muss vor dem Enddatum liegen!'
                    );
                    return false;
                }

                const newEvent: CalendarEventRequestDTO = {
                    name,
                    description,
                    location,
                    fullday: true,
                    dstart,
                    dend,
                    dtstart: null,
                    dtend: null,
                };

                Swal.showLoading();
                return await action(calendarId, newEvent);
            } else {
                const dtstart = $('#swal-input-dtstart').val() as string;
                const dtend = $('#swal-input-dtend').val() as string;

                if (!dtstart || !dtend) {
                    Swal.showValidationMessage(
                        'Start- und Endzeit sind Pflichtfelder!'
                    );
                    return false;
                }
                if (new Date(dtstart) > new Date(dtend)) {
                    Swal.showValidationMessage(
                        'Startdatum muss vor dem Enddatum liegen!'
                    );
                    return false;
                }

                const newEvent: CalendarEventRequestDTO = {
                    name,
                    description,
                    location,
                    fullday: false,
                    dstart: null,
                    dend: null,
                    dtstart: isoFormat(dtstart),
                    dtend: isoFormat(dtend),
                };

                Swal.showLoading();
                return await action(calendarId, newEvent);
            }
        },
    });
}

// Event creation

export async function createEvent(
    teamId: ID,
    calendarId: ID,
    event: CalendarEventRequestDTO
) {
    return await CalendarAPI.createEvent(teamId, calendarId, event).then(
        (data) => {
            CacheService.getTeamData(teamId).calendars[calendarId].events[
                data.id
            ] = data.event;
            return data.event;
        }
    );
}

export async function createEventPopup(
    team: Team,
    date: Date,
    calendars: Calendar[],
    selectedCalendarId: ID
) {
    const _dt = localInputFormat(date);

    const prefilledEvent: CalendarEvent = {
        id: '',
        name: '',
        description: '',
        location: '',
        fullday: false,
        dtstart: _dt,
        dtend: _dt,
        dstart: null,
        dend: null,
    };

    return await generalizedEventPopup({
        team: team,
        prefilledEvent: prefilledEvent,
        calendars: calendars,
        selectedCalendarId: selectedCalendarId,
        titleText: 'Ereignis erstellen',
        confirmButtonText: 'Erstellen',
        action: async (calendarId, newEvent) => {
            return await createEvent(team.id, calendarId, newEvent);
        },
    });
}

// Event edit

export async function editEvent(
    teamId: ID,
    calendarId: ID,
    eventId: ID,
    event: CalendarEventRequestDTO
) {
    return await CalendarAPI.updateEvent(
        teamId,
        calendarId,
        eventId,
        event
    ).then((data) => {
        CacheService.getTeamData(teamId).calendars[calendarId].events[eventId] =
            data.event;
        return data.event;
    });
}

export async function moveEvent(
    teamId: ID,
    calendarId: ID,
    eventId: ID,
    calendarId2: ID
) {
    return await CalendarAPI.moveEvent(
        teamId,
        calendarId,
        eventId,
        calendarId2
    ).then(() => {
        const teamData = CacheService.getTeamData(teamId);
        teamData.calendars[calendarId2].events[eventId] =
            teamData.calendars[calendarId].events[eventId];
        delete teamData.calendars[calendarId].events[eventId];
    });
}

export async function editEventPopup(
    team: Team,
    calendar: Calendar,
    calendars: Calendar[],
    event: CalendarEvent,
    makeCopy = false
) {
    return await generalizedEventPopup({
        team: team,
        prefilledEvent: event,
        calendars: calendars,
        selectedCalendarId: calendar.id,
        titleText: makeCopy ? 'Ereignis kopieren' : 'Ereignis bearbeiten',
        confirmButtonText: makeCopy ? 'Kopie erstellen' : 'Speichern',
        action: async (newCalendarId, newEvent) => {
            if (makeCopy) {
                return await createEvent(team.id, newCalendarId, newEvent);
            } else if (newCalendarId == calendar.id) {
                return await editEvent(
                    team.id,
                    calendar.id,
                    event.id,
                    newEvent
                );
            } else {
                await moveEvent(team.id, calendar.id, event.id, newCalendarId);
                return await editEvent(
                    team.id,
                    newCalendarId,
                    event.id,
                    newEvent
                );
            }
        },
    });
}

// Event deletion

export async function deleteEvent(teamId: ID, calendarId: ID, eventId: ID) {
    return await CalendarAPI.deleteEvent(teamId, calendarId, eventId).then(
        () => {
            delete CacheService.getTeamData(teamId).calendars[calendarId]
                .events[eventId];
        }
    );
}

export async function deleteEventPopup(
    team: Team,
    calendar: Calendar,
    event: CalendarEvent
) {
    return await confirmAlert(
        <>
            Willst du folgendes Ereignis wirklich löschen?
            <br />
            <br />
            <b>Name:</b> {event.name} <br />
            <b>Beschreibung: </b>
            {event.description}
        </>,
        async () => await deleteEvent(team.id, calendar.id, event.id)
    );
}
