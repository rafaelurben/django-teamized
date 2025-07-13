/**
 * Functions used in the calendar module
 */

import $ from 'jquery';

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
    isInRange,
    isoFormat,
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
        html: `
            <p>Team: ${team.name}</p><hr />
            <label class="swal2-input-label" for="swal-input-name">Name:</label>
            <input type="text" id="swal-input-name" class="swal2-input" placeholder="Kalendername">
            <label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>
            <textarea id="swal-input-description" class="swal2-textarea" placeholder="Kalenderbeschreibung"></textarea>
            <label class="swal2-input-label" for="swal-input-color">Farbe:</label>
            <input type="color" id="swal-input-color" class="swal2-input form-control-color">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Erstellen',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const name = (<HTMLInputElement>(
                document.getElementById('swal-input-name')
            )).value;
            const description = (<HTMLInputElement>(
                document.getElementById('swal-input-description')
            )).value;
            const color = (<HTMLInputElement>(
                document.getElementById('swal-input-color')
            )).value;

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
        html: `
            <p>Team: ${team.name}</p><hr />
            <label class="swal2-input-label" for="swal-input-name">Name:</label>
            <input type="text" id="swal-input-name" class="swal2-input" placeholder="${calendar.name}" value="${calendar.name}">
            <label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>
            <textarea id="swal-input-description" class="swal2-textarea" placeholder="${calendar.description}">${calendar.description}</textarea>
            <label class="swal2-input-label" for="swal-input-color">Farbe:</label>
            <input type="color" id="swal-input-color" class="swal2-input form-control-color" value="${calendar.color}">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Speichern',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const name = (<HTMLInputElement>(
                document.getElementById('swal-input-name')
            )).value;
            const description = (<HTMLInputElement>(
                document.getElementById('swal-input-description')
            )).value;
            const color = (<HTMLInputElement>(
                document.getElementById('swal-input-color')
            )).value;

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
        `Willst du folgenden Kalender wirklich löschen?<br /><br />
            <b>Name:</b> ${calendar.name} <br />
            <b>Beschreibung: </b>${calendar.description} <br />
            <b>Anzahl Events: </b>${Object.keys(calendar.events).length}
        `,
        async () => await deleteCalendar(team.id, calendar.id)
    );
}

// Calendar subscription

export async function showCalendarSubscriptionPopup(calendar: Calendar) {
    const urlHTTP = calendar.ics_url;
    const urlWebcal = 'webcal://' + urlHTTP.split('//')[1];

    fireAlert({
        title: 'Kalender abonnieren',
        html: `
    Um den Kalender zu abonnieren, hast du zwei Möglichkeiten:
    <hr>
    <h5>1) Webcal-Link</h5>
    <p>Auf allen Apple-Geräten sowie weiteren unterstützten Geräten kannst du Webcal-Links direkt in deiner Kalender-App
    öffnen. Bei manchen anderen Apps (z. B. Google Calendar) musst du den Link kopieren und manuell einfügen.</p>
    <a href="${urlWebcal}" target="_blank" class="btn btn-outline-info">Webcal-URL</a>
    <hr>
    <h5>2) HTTP(S)-Link</h5>
    <p>Falls dein Gerät oder deine App Webcal-Links nicht unterstützt, kannst du auch folgenden Link verwenden. Füge
    diesen im "Kalender abonnieren"-Dialog (o. ä.) deiner Kalenderapp ein.</p>
    <input class="swal2-input" type="url" readonly value="${urlHTTP}">
  `,
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonText: 'Schliessen',
    });
}

// Event SWAL utils

function _updateFullDayToggle(noDateUpdate: boolean = false) {
    const fullDay = <boolean>$('#swal-input-fullday').prop('checked');
    if (fullDay) {
        $('.fullday-only').show();
        $('.partday-only').hide();
        if (!noDateUpdate) {
            $('#swal-input-dstart').val(
                localInputFormat(<string>$('#swal-input-dtstart').val(), true)
            );
            $('#swal-input-dend').val(
                localInputFormat(<string>$('#swal-input-dtend').val(), true)
            );
        }
    } else {
        $('.fullday-only').hide();
        $('.partday-only').show();
        if (!noDateUpdate) {
            $('#swal-input-dtstart').val(
                localInputFormat(
                    isoFormat(<string>$('#swal-input-dstart').val()),
                    false
                )
            );
            $('#swal-input-dtend').val(
                localInputFormat(
                    isoFormat(<string>$('#swal-input-dend').val()),
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
        html: `
            <p>Team: ${team.name}</p><hr />
            <label class="swal2-input-label" for="swal-input-calendar">Kalender:</label>
            <select id="swal-input-calendar" class="swal2-input swal2-select"></select><hr />
            <label class="swal2-input-label" for="swal-input-name">Name:</label>
            <input type="text" id="swal-input-name" class="swal2-input" placeholder="${prefilledEvent.name}" value="${prefilledEvent.name}">
            <label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>
            <textarea id="swal-input-description" class="swal2-textarea" placeholder="${prefilledEvent.description}">${prefilledEvent.description}</textarea>
            <label class="swal2-input-label" for="swal-input-location">Ort:</label>
            <input type="text" id="swal-input-location" class="swal2-input" placeholder="${prefilledEvent.location}" value="${prefilledEvent.location}">
            <label for="swal-input-fullday" class="swal2-checkbox d-flex">
                <input type="checkbox" ${prefilledEvent.fullday ? 'checked' : ''} id="swal-input-fullday">
                <span class="swal2-label">Ganztägig</span>
            </label><hr />
            <label class="swal2-input-label fullday-only" for="swal-input-dstart">Von:</label>
            <input type="date" id="swal-input-dstart" class="swal2-input fullday-only" value="${dstart}">
            <label class="swal2-input-label fullday-only" for="swal-input-dend">Bis:</label>
            <input type="date" id="swal-input-dend" class="swal2-input fullday-only" value="${dend}">
            <label class="swal2-input-label partday-only" for="swal-input-dtstart">Von:</label>
            <input type="datetime-local" id="swal-input-dtstart" class="swal2-input partday-only" value="${dtstart}">
            <label class="swal2-input-label partday-only" for="swal-input-dtend">Bis:</label>
            <input type="datetime-local" id="swal-input-dtend" class="swal2-input partday-only" value="${dtend}">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: confirmButtonText,
        cancelButtonText: 'Abbrechen',
        didOpen: () => {
            _updateFullDayToggle(true);
            $('#swal-input-fullday').on('change', () => _updateFullDayToggle());

            const $calendarsInput = $('#swal-input-calendar');
            $calendarsInput.html(
                calendars
                    .map(
                        (calendar) => `
                                <option value="${calendar.id}">
                                    ${calendar.name}
                                </option>
                            `
                    )
                    .join('')
            );
            $calendarsInput.val(selectedCalendarId);
        },
        preConfirm: async () => {
            const calendarId = <ID>$('#swal-input-calendar').val();
            const name = <string>$('#swal-input-name').val();
            const description = <string>$('#swal-input-description').val();
            const location = <string>$('#swal-input-location').val();
            const fullday = <boolean>$('#swal-input-fullday').prop('checked');

            if (!name) {
                Swal.showValidationMessage('Es wird ein Name benötigt!');
                return false;
            }

            if (fullday) {
                const dstart = <string>$('#swal-input-dstart').val();
                const dend = <string>$('#swal-input-dend').val();

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
                const dtstart = <string>$('#swal-input-dtstart').val();
                const dtend = <string>$('#swal-input-dtend').val();

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
        'Willst du folgendes Ereignis wirklich löschen?<br /><br />' +
            `<b>Name:</b> ${event.name} <br /><b>Beschreibung: </b>${event.description}`,
        async () => await deleteEvent(team.id, calendar.id, event.id)
    );
}
