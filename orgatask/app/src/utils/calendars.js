import { requestSuccessAlert, successAlert, waitingAlert, doubleConfirmAlert, confirmAlert } from "./alerts.js";
import * as API from "./api.js";
import * as Cache from "./cache.js";
import * as Navigation from "./navigation.js";

// Date utils

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

export function getMondayOfWeek(date) {
    const dayOfWeek = (date.getDay() || 7) -1; // make 0 = monday instead of sunday
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

// Calendar utils

export function flattenCalendarEvents(calendars) {
    // Merge events from calendars into a single object

    let events = {};
    Object.values(calendars).forEach(calendar => {
        calendar.events.forEach(event => {
            events[event.id] = {
                ...event,
                calendar,
            };
        });
    });
    return events;
}

export function filterCalendarEventsByTimeRange(events, start, end) {
    return events.filter(event => {
        if (event.fullday) {
            return (
                new Date(event.dstart).getTime() <= end.getTime() && 
                new Date(event.dend).getTime() >= start.getTime()
            );
        } else {
            return (
                new Date(event.dtstart).getTime() <= end.getTime() &&
                new Date(event.dtend).getTime() >= start.getTime()
            );
        }
    });
}

export function filterCalendarEventsByDate(events, date) {
    return filterCalendarEventsByTimeRange(events, roundDays(date), roundDays(date, 1));
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
        html:
            `<p>Team: ${team.name}</p>` +
            '<label class="swal2-input-label" for="swal-input-name">Name:</label>' +
            '<input type="text" id="swal-input-name" class="swal2-input" placeholder="Kalendername">' +
            '<label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>' +
            '<textarea id="swal-input-description" class="swal2-textarea" placeholder="Kalenderbeschreibung"></textarea>' +
            '<label class="swal2-input-label" for="swal-input-color">Farbe:</label>' +
            '<input type="color" id="swal-input-color" class="swal2-input form-control-color w-50">',
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

            if (!name || !description) {
                Swal.showValidationMessage("Bitte fülle alle Felder aus");
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
        html:
            `<p>Team: ${team.name}</p>` +
            '<label class="swal2-input-label" for="swal-input-name">Name:</label>' +
            `<input type="text" id="swal-input-name" class="swal2-input" placeholder="${calendar.name}" value="${calendar.name}">` +
            '<label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>' +
            `<textarea id="swal-input-description" class="swal2-textarea" placeholder="${calendar.description}">${calendar.description}</textarea>`+
            '<label class="swal2-input-label" for="swal-input-color">Farbe:</label>' +
            `<input type="color" id="swal-input-color" class="swal2-input form-control-color w-50" value="${calendar.color}">`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Aktualisieren",
        cancelButtonText: "Abbrechen",
        preConfirm: async () => {
            const name = document.getElementById("swal-input-name").value;
            const description = document.getElementById(
                "swal-input-description"
            ).value;
            const color = document.getElementById("swal-input-color").value;

            if (!name || !description) {
                Swal.showValidationMessage("Bitte fülle alle Felder aus");
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
            Navigation.renderPage();
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
