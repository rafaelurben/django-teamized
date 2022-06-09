import { requestSuccessAlert, successAlert, waitingAlert } from "./alerts.js";
import * as API from "./api.js";
import * as Cache from "./cache.js";

// Calendar list

export async function getCalendars(teamId) {
    return await Cache.refreshTeamCacheCategory(teamId, "calendars");
}

// Calendar creation

export async function createCalendar(teamId, name, description, color) {
    return await API.POST(`teams/${teamId}/calendars`, {
        name, description, color
    }).then(
        async (data) => {
            requestSuccessAlert(data);
            Cache.getTeamData(teamId).calendars[data.calendar.id] = data.calendar;
            return data.calendar;
        }
    )
}

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

export async function deleteCalendar(teamId, calendarId) {
    await API.DELETE(`teams/${teamId}/calendars/${calendarId}`).then(
        async (data) => {
            requestSuccessAlert(data);
            delete Cache.getTeamData(teamId).calendars[calendarId];
        }
    )
}
