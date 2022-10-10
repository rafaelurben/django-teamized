import { successAlert, waitingAlert, requestSuccessAlert, confirmAlert } from "./alerts.js";
import * as API from "./api.js";
import * as Cache from "./cache.js";
import * as Navigation from "./navigation.js";
import { isoFormat, localInputFormat } from "./datetime.js";

export async function getMyWorkSessionsInTeam(teamId) {
    return await Cache.refreshTeamCacheCategory(teamId, "me_worksessions");
}

// WorkSession creation

export async function createWorkSession(teamId, note, dtstart, dtend) {
    return await API.POST(`teams/${teamId}/me/worksessions`, {
        note, time_start: isoFormat(dtstart), time_end: isoFormat(dtend)
    }).then(
        (data) => {
            requestSuccessAlert(data);
            Cache.getCurrentTeamData().me_worksessions[data.session.id] = data.session;
            return data.session;
        }
    )
}

export async function createWorkSessionPopup(team) {
    const _dt = localInputFormat(new Date());
    return (await Swal.fire({
        title: `Sitzung erstellen`,
        html:
            `<p>Team: ${team.name}</p><hr />` +
            '<label class="swal2-input-label" for="swal-input-note">Notiz:</label>' +
            '<textarea id="swal-input-note" class="swal2-textarea" placeholder="Notiz"></textarea>' +
            '<label class="swal2-input-label" for="swal-input-dtstart">Von:</label>' +
            `<input type="datetime-local" id="swal-input-dtstart" class="swal2-input" value="${_dt}">` +
            '<label class="swal2-input-label" for="swal-input-dtend">Bis:</label>' +
            `<input type="datetime-local" id="swal-input-dtend" class="swal2-input" value="${_dt}">`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Erstellen",
        cancelButtonText: "Abbrechen",
        preConfirm: async () => {
            const note = document.getElementById("swal-input-note").value;
            const dtstart = document.getElementById("swal-input-dtstart").value;
            const dtend = document.getElementById("swal-input-dtend").value;

            if (!dtstart || !dtend) {
                Swal.showValidationMessage("Start- und Endzeit sind Pflichtfelder!");
                return false;
            }

            Swal.showLoading();
            return await createWorkSession(team.id, note, dtstart, dtend);
        },
    })).value;
}

// WorkSession edit

export async function editWorkSession(teamId, sessionId, note, dtstart, dtend) {
    return await API.POST(`teams/${teamId}/me/worksessions/${sessionId}`, {
        note, time_start: isoFormat(dtstart), time_end: isoFormat(dtend)
    }).then(
        async (data) => {
            requestSuccessAlert(data);
            Cache.getCurrentTeamData().me_worksessions[data.session.id] = data.session;
            return data.session;
        }
    )
}

export async function editWorkSessionPopup(team, session) {
    let dtstart = localInputFormat(session.time_start);
    let dtend = localInputFormat(session.time_end);
    return (await Swal.fire({
        title: `Sitzung bearbeiten`,
        html:
            '<label class="swal2-input-label" for="swal-input-note">Notiz:</label>' +
            `<textarea id="swal-input-note" class="swal2-textarea" placeholder="Notiz">${session.note}</textarea>` +
            (session.is_created_via_tracking ?
                '<hr><p class="swal2-text mt-3 mb-0 small opacity-50 px-3">Start- und Endzeit können nur bei manuell erfassten Sitzungen geändert werden.</p>'
                :
                '<label class="swal2-input-label" for="swal-input-dtstart">Von:</label>' +
                `<input type="datetime-local" id="swal-input-dtstart" class="swal2-input" value="${dtstart}">` +
                '<label class="swal2-input-label" for="swal-input-dtend">Bis:</label>' +
                `<input type="datetime-local" id="swal-input-dtend" class="swal2-input" value="${dtend}">`
            ),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Speichern",
        cancelButtonText: "Abbrechen",
        preConfirm: async () => {
            const note = document.getElementById("swal-input-note").value;

            if (!session.is_created_via_tracking) {
                dtstart = document.getElementById("swal-input-dtstart").value;
                dtend = document.getElementById("swal-input-dtend").value;
                if (!dtstart || !dtend) {
                    Swal.showValidationMessage("Start- und Endzeit sind Pflichtfelder!");
                    return false;
                }
            }

            Swal.showLoading();
            return await editWorkSession(team.id, session.id, note, dtstart, dtend);
        },
    })).value;
}

// WorkSession deletion

export async function deleteWorkSession(teamId, sessionId) {
    return await API.DELETE(`teams/${teamId}/me/worksessions/${sessionId}`).then(
        async (data) => {
            requestSuccessAlert(data);
            delete Cache.getCurrentTeamData().me_worksessions[sessionId];
        }
    )
}

export async function deleteWorkSessionPopup(team, session) {
    await confirmAlert(
        "Willst du folgende Sitzung wirklich löschen?<br /><br />" +
        `<b>Notiz:</b> ${session.note}`,
        async () => await deleteWorkSession(team.id, session.id)
    );
}


// Tracking

export async function startTrackingSession(teamId) {
    waitingAlert("Wird gestartet...");
    return await API.POST(`me/worksessions/tracking/start/t=${teamId}`).then(
        (data) => {
            successAlert("Die Zeitmessung wurde gestartet", "Tracking gestartet");
            window.appdata.current_worksession = data.session;
            return data.session;
        }
    );
}

export async function getTrackingSession() {
    return await API.GET("me/worksessions/tracking/live", {}, "no-error-handling").then(
        (data) => {
            if (data.error === "no_active_tracking_session_exists") {
                window.appdata.current_worksession = null;
                return null;
            }

            window.appdata.current_worksession = data.session;
            Navigation.renderPage();
            return data.session;
        }
    ).catch(
        (error) => {
            window.appdata.current_worksession = null;
            return null;
        }
    );
}

export async function stopTrackingSession() {
    waitingAlert("Wird gestoppt...");
    return await API.POST("me/worksessions/tracking/stop").then(
        (data) => {
            successAlert("Die Zeitmessung wurde gestoppt", "Tracking gestoppt");
            window.appdata.current_worksession = null;
            Cache.getCurrentTeamData().me_worksessions[data.session.id] = data.session;
            return data.session;
        }
    );
}

// Rename session without the date options/text

export async function renameWorkSession(teamId, sessionId, note) {
    return await API.POST(`teams/${teamId}/me/worksessions/${sessionId}`, {
        note
    }).then(
        async (data) => {
            requestSuccessAlert(data);
            if (data.session.id in Cache.getCurrentTeamData().me_worksessions) {
                Cache.getCurrentTeamData().me_worksessions[data.session.id] = data.session;
            }
            if (window.appdata.current_worksession && window.appdata.current_worksession.id === data.session.id) {
                window.appdata.current_worksession = data.session;
            }
            return data.session;
        }
    )
}

export async function renameWorkSessionPopup(team, session) {
    return (await Swal.fire({
        title: `Sitzung umbenennen`,
        html:
            `<textarea id="swal-input-note" class="swal2-textarea" placeholder="Notiz">${session.note}</textarea>`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Speichern",
        cancelButtonText: "Abbrechen",
        preConfirm: async () => {
            const note = document.getElementById("swal-input-note").value;

            Swal.showLoading();
            return await renameWorkSession(team.id, session.id, note);
        },
    })).value;
}
