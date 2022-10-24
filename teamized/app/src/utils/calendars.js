/**
 * Functions used in the calendar module
 */

import { requestSuccessAlert, doubleConfirmAlert, confirmAlert } from "./alerts.js";
import * as API from "./api.js";
import * as Cache from "./cache.js";
import { roundDays, isInRange, isoFormat, localInputFormat } from "./datetime.js";

// Reexport so that datetime.js functions can also be imported from calendars.js
export * from "./datetime.js";

// Calendar utils

/**
 * Check wheter a date is during an event
 * 
 * @param {Date} date 
 * @param {object} evt the event object
 * @returns {Boolean}
 */
export function isDateInEvent(date, evt) {
    var evtStart; var evtEnd;
    if (evt.fullday) {
        // roundDays() for fullday events is used to avoid issues with timezones
        evtStart = roundDays(new Date(evt.dstart));
        evtEnd = roundDays(new Date(evt.dend));
    } else {
        evtStart = roundDays(new Date(evt.dtstart));
        evtEnd = new Date(evt.dtend);
    }
    return isInRange(date, evtStart, evtEnd);
}

/**
 * Flattens an object of calendars into an array of events
 * (e.g. merge events from all calendars into a single array)
 * 
 * @param {object} calendars 
 * @returns {Array}
 */
export function flattenCalendarEvents(calendars) {
    let events = {};
    Object.values(calendars).forEach(calendar => {
        Object.values(calendar.events).forEach(evt => {
            events[evt.id] = {
                ...evt,
                calendar,
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
 * @returns {Array}
 */
export function filterCalendarEventsByDate(events, date) {
    return events.filter(event => {
        return isDateInEvent(date, event);
    });
}

// Calendar list

export async function getCalendars(teamId) {
    return await Cache.refreshTeamCacheCategory(teamId, "calendars");
}

// Calendar creation

export async function createCalendar(teamId, name, description, color) {
    return await API.POST(`teams/${teamId}/calendars`, {
        name, description, color
    }).then(
        (data) => {
            requestSuccessAlert(data);
            Cache.getTeamData(teamId).calendars[data.calendar.id] = data.calendar;
            return data.calendar;
        }
    )
}

export async function createCalendarPopup(team) {
    return (await Swal.fire({
        title: `Kalender erstellen`,
        html: `
            <p>Team: ${team.name}</p><hr />
            <label class="swal2-input-label" for="swal-input-name">Name:</label>
            <input type="text" id="swal-input-name" class="swal2-input" placeholder="Kalendername">
            <label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>
            <textarea id="swal-input-description" class="swal2-textarea" placeholder="Kalenderbeschreibung"></textarea>
            <label class="swal2-input-label" for="swal-input-color">Farbe:</label>
            <input type="color" id="swal-input-color" class="swal2-input form-control-color w-50">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Erstellen",
        cancelButtonText: "Abbrechen",
        preConfirm: async () => {
            const name = document.getElementById("swal-input-name").value;
            const description = document.getElementById(
                "swal-input-description"
            ).value;
            const color = document.getElementById("swal-input-color").value;

            if (!name) {
                Swal.showValidationMessage("Bitte gib einen Namen ein");
                return false;
            }

            Swal.showLoading();
            return await createCalendar(team.id, name, description, color);
        },
    })).value;
}

// Calendar edit

export async function editCalendar(teamId, calendarId, name, description, color) {
    return await API.POST(`teams/${teamId}/calendars/${calendarId}`, {
        name, description, color
    }).then(
        (data) => {
            requestSuccessAlert(data);
            Cache.getTeamData(teamId).calendars[data.calendar.id] = data.calendar;
            return data.calendar;
        }
    )
}

export async function editCalendarPopup(team, calendar) {
    return (await Swal.fire({
        title: `Kalender bearbeiten`,
        html: `
            <p>Team: ${team.name}</p><hr />
            <label class="swal2-input-label" for="swal-input-name">Name:</label>
            <input type="text" id="swal-input-name" class="swal2-input" placeholder="${calendar.name}" value="${calendar.name}">
            <label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>
            <textarea id="swal-input-description" class="swal2-textarea" placeholder="${calendar.description}">${calendar.description}</textarea>
            <label class="swal2-input-label" for="swal-input-color">Farbe:</label>
            <input type="color" id="swal-input-color" class="swal2-input form-control-color w-50" value="${calendar.color}">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Speichern",
        cancelButtonText: "Abbrechen",
        preConfirm: async () => {
            const name = document.getElementById("swal-input-name").value;
            const description = document.getElementById(
                "swal-input-description"
            ).value;
            const color = document.getElementById("swal-input-color").value;

            if (!name) {
                Swal.showValidationMessage("Bitte gib einen Namen ein!");
                return false;
            }

            Swal.showLoading();
            return await editCalendar(team.id, calendar.id, name, description, color);
        },
    })).value;
}

// Calendar deletion

export async function deleteCalendar(teamId, calendarId) {
    await API.DELETE(`teams/${teamId}/calendars/${calendarId}`).then(
        (data) => {
            requestSuccessAlert(data);
            delete Cache.getTeamData(teamId).calendars[calendarId];
        }
    )
}

export async function deleteCalendarPopup(team, calendar) {
    await doubleConfirmAlert(
        "Willst du folgenden Kalender wirklich löschen?<br /><br />" +
        `<b>Name:</b> ${calendar.name} <br /><b>Beschreibung: </b>${calendar.description}`,
        async () => await deleteCalendar(team.id, calendar.id)
    );
}

// Event SWAL utils

function _updateFullDayToggle(noDateUpdate) {
    const fullDay = document.getElementById("swal-input-fullday").checked;
    if (fullDay) {
        $('.fullday-only').show();
        $('.partday-only').hide();
        if (!noDateUpdate) {
            $('#swal-input-dstart').val(localInputFormat($('#swal-input-dtstart').val(), true));
            $('#swal-input-dend').val(localInputFormat($('#swal-input-dtend').val(), true));
        }
    } else {
        $('.fullday-only').hide();
        $('.partday-only').show();
        if (!noDateUpdate) {
            $('#swal-input-dtstart').val(localInputFormat(isoFormat($('#swal-input-dstart').val()), false));
            $('#swal-input-dtend').val(localInputFormat(isoFormat($('#swal-input-dend').val()), false));
        }
    }
}

// Event creation

export async function createEvent(teamId, calendarId, name, description, location, fullday, dstart, dend, dtstart, dtend) {
    return await API.POST(`teams/${teamId}/calendars/${calendarId}/events`, {
        name, description, location, fullday, dstart, dend, dtstart: isoFormat(dtstart), dtend: isoFormat(dtend)
    }).then(
        (data) => {
            requestSuccessAlert(data);
            Cache.getTeamData(teamId).calendars[calendarId].events[data.id] = data.event;
            return data.event;
        }
    )
}

export function createEventPopup(team, date, calendars, selectedCalendarId) {
    return new Promise((resolve, reject) => {
        let _dt = localInputFormat(date);
        let _d = localInputFormat(date, true);
        Swal.fire({
            title: `Ereignis erstellen`,
            html: `
                <p>Team: ${team.name}</p><hr />
                <label class="swal2-input-label" for="swal-input-calendar">Kalender:</label>
                <select id="swal-input-calendar" class="swal2-input swal2-select"></select><hr />
                <label class="swal2-input-label" for="swal-input-name">Name:</label>
                <input type="text" id="swal-input-name" class="swal2-input" placeholder="Name">
                <label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>
                <textarea id="swal-input-description" class="swal2-textarea" placeholder="Beschreibung"></textarea>
                <label class="swal2-input-label" for="swal-input-location">Ort:</label>
                <input type="text" id="swal-input-location" class="swal2-input" placeholder="Ort">
                <label for="swal-input-fullday" class="swal2-checkbox d-flex">
                    <input type="checkbox" value="0" id="swal-input-fullday">
                    <span class="swal2-label">Ganztägig</span>
                </label><hr />
                <label class="swal2-input-label fullday-only" for="swal-input-dstart">Von:</label>
                <input type="date" id="swal-input-dstart" class="swal2-input fullday-only" value="${_d}">
                <label class="swal2-input-label fullday-only" for="swal-input-dend">Bis:</label>
                <input type="date" id="swal-input-dend" class="swal2-input fullday-only" value="${_d}">
                <label class="swal2-input-label partday-only" for="swal-input-dtstart">Von:</label>
                <input type="datetime-local" id="swal-input-dtstart" class="swal2-input partday-only" value="${_dt}">
                <label class="swal2-input-label partday-only" for="swal-input-dtend">Bis:</label>
                <input type="datetime-local" id="swal-input-dtend" class="swal2-input partday-only" value="${_dt}">
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Erstellen",
            cancelButtonText: "Abbrechen",
            didOpen: () => {
                _updateFullDayToggle(true);
                $('#swal-input-fullday').on('change', () => _updateFullDayToggle());
                $('#swal-input-calendar').html(
                    Object.entries(calendars).map(
                        ([calId, calendar]) => (`
                            <option key="${calId}" value="${calId}">
                                ${calendar.name}
                            </option>
                        `)
                    ).join('')
                );
                $('#swal-input-calendar').val(selectedCalendarId);
            },
            preConfirm: async () => {
                let calendarId = $('#swal-input-calendar').val();
                let name = $("#swal-input-name").val();
                let description = $("#swal-input-description").val();
                let location = $("#swal-input-location").val();
                let fullday = $("#swal-input-fullday").prop("checked");

                if (!name) {
                    Swal.showValidationMessage("Es wird ein Name benötigt!");
                    return false;
                }

                if (fullday) {
                    let dstart = $("#swal-input-dstart").val();
                    let dend = $("#swal-input-dend").val();

                    if (!dstart || !dend) {
                        Swal.showValidationMessage("Start- und Enddatum sind Pflichtfelder!");
                        return false;
                    }
                    if (new Date(dstart) > new Date(dend)) {
                        Swal.showValidationMessage("Startdatum muss vor dem Enddatum liegen!");
                        return false;
                    }

                    Swal.showLoading();
                    await createEvent(team.id, calendarId, name, description, location, true, dstart, dend, null, null).then(
                        resolve, reject
                    );
                } else {
                    let dtstart = $("#swal-input-dtstart").val();
                    let dtend = $("#swal-input-dtend").val();

                    if (!dtstart || !dtend) {
                        Swal.showValidationMessage("Start- und Endzeit sind Pflichtfelder!");
                        return false;
                    }
                    if (new Date(dtstart) > new Date(dtend)) {
                        Swal.showValidationMessage("Startdatum muss vor dem Enddatum liegen!");
                        return false;
                    }

                    Swal.showLoading();
                    await createEvent(team.id, calendarId, name, description, location, false, null, null, dtstart, dtend).then(
                        resolve, reject
                    );
                }
            },
        });
    });
}

// Event edit

export async function editEvent(teamId, calendarId, eventId, name, description, location, fullday, dstart, dend, dtstart, dtend) {
    return await API.POST(`teams/${teamId}/calendars/${calendarId}/events/${eventId}`, {
        name, description, location, fullday, dstart, dend, dtstart: isoFormat(dtstart), dtend: isoFormat(dtend)
    }).then(
        (data) => {
            requestSuccessAlert(data);
            Cache.getTeamData(teamId).calendars[calendarId].events[eventId] = data.event;
            return data.event;
        }
    )
}

export function editEventPopup(team, calendar, event, makeCopy = false) {
    return new Promise((resolve, reject) => {
        var dstart; var dend; var dtstart; var dtend;

        if (event.fullday) {
            dstart = localInputFormat(event.dstart, true);
            dend = localInputFormat(event.dend, true);
        } else {
            dtstart = localInputFormat(event.dtstart);
            dtend = localInputFormat(event.dtend);
        }

        Swal.fire({
            title: makeCopy ? "Ereignis kopieren" : "Ereignis bearbeiten",
            html: `
                <p>Team: ${team.name}</p>
                <p>Kalender: ${calendar.name}</p><hr />
                <label class="swal2-input-label" for="swal-input-name">Name:</label>
                <input type="text" id="swal-input-name" class="swal2-input" placeholder="${event.name}" value="${event.name}">
                <label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>
                <textarea id="swal-input-description" class="swal2-textarea" placeholder="${event.description}">${event.description}</textarea>
                <label class="swal2-input-label" for="swal-input-location">Ort:</label>
                <input type="text" id="swal-input-location" class="swal2-input" placeholder="${event.location}" value="${event.location}">
                <label for="swal-input-fullday" class="swal2-checkbox d-flex">
                    <input type="checkbox" ${event.fullday ? "checked" : ""} id="swal-input-fullday">
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
            confirmButtonText: makeCopy ? "Kopie erstellen" : "Speichern",
            cancelButtonText: "Abbrechen",
            didOpen: () => {
                _updateFullDayToggle(true);
                $('#swal-input-fullday').on('change', () => _updateFullDayToggle());

            },
            preConfirm: async () => {
                let name = $("#swal-input-name").val();
                let description = $("#swal-input-description").val();
                let location = $("#swal-input-location").val();
                let fullday = $("#swal-input-fullday").prop("checked");

                if (!name) {
                    Swal.showValidationMessage("Es wird ein Name benötigt!");
                    return false;
                }

                if (fullday) {
                    let dstart = $("#swal-input-dstart").val();
                    let dend = $("#swal-input-dend").val();

                    if (!dstart || !dend) {
                        Swal.showValidationMessage("Start- und Enddatum sind Pflichtfelder!");
                        return false;
                    }
                    if (new Date(dstart) > new Date(dend)) {
                        Swal.showValidationMessage("Startdatum muss vor dem Enddatum liegen!");
                        return false;
                    }

                    Swal.showLoading();
                    if (makeCopy) {
                        await createEvent(team.id, calendar.id, name, description, location, true, dstart, dend, null, null).then(
                            resolve, reject
                        );
                    } else {
                        await editEvent(team.id, calendar.id, event.id, name, description, location, true, dstart, dend, null, null).then(
                            resolve, reject
                        );
                    }
                } else {
                    let dtstart = $("#swal-input-dtstart").val();
                    let dtend = $("#swal-input-dtend").val();

                    if (!dtstart || !dtend) {
                        Swal.showValidationMessage("Start- und Endzeit sind Pflichtfelder!");
                        return false;
                    }
                    if (new Date(dtstart) > new Date(dtend)) {
                        Swal.showValidationMessage("Startdatum muss vor dem Enddatum liegen!");
                        return false;
                    }

                    Swal.showLoading();
                    if (makeCopy) {
                        await createEvent(team.id, calendar.id, name, description, location, false, null, null, dtstart, dtend).then(
                            resolve, reject
                        );
                    } else {
                        await editEvent(team.id, calendar.id, event.id, name, description, location, false, null, null, dtstart, dtend).then(
                            resolve, reject
                        );
                    }
                }
            },
        });
    });
}

// Event deletion

export async function deleteEvent(teamId, calendarId, eventId) {
    return await API.DELETE(`teams/${teamId}/calendars/${calendarId}/events/${eventId}`).then(
        (data) => {
            requestSuccessAlert(data);
            delete Cache.getTeamData(teamId).calendars[calendarId].events[eventId];
        }
    )
}

export async function deleteEventPopup(team, calendar, event) {
    await confirmAlert(
        "Willst du folgendes Ereignis wirklich löschen?<br /><br />" +
        `<b>Name:</b> ${event.name} <br /><b>Beschreibung: </b>${event.description}`,
        async () => await deleteEvent(team.id, calendar.id, event.id)
    );
}
