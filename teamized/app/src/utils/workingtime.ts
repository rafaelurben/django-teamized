/**
 * Functions used in the workingtime module
 */

import {
    confirmAlert,
    requestSuccessAlert,
    successAlert,
    Swal,
    waitingAlert,
} from './alerts';
import * as WorkingtimeAPI from '../api/workingtime';
import * as Cache from './cache.js';
import * as Navigation from './navigation';
import { isoFormat, localInputFormat } from './datetime';
import { ID } from '../interfaces/common';
import {
    Worksession,
    WorksessionRequestDTO,
} from '../interfaces/workingtime/worksession';

export async function getMyWorkSessionsInTeam(teamId: ID) {
    return await Cache.refreshTeamCacheCategory(teamId, 'me_worksessions');
}

// WorkSession creation

export async function createWorkSession(
    teamId: ID,
    session: WorksessionRequestDTO
) {
    return await WorkingtimeAPI.createWorksession(teamId, session).then(
        (data) => {
            requestSuccessAlert(data);
            Cache.getCurrentTeamData().me_worksessions[data.session.id] =
                data.session;
            return data.session;
        }
    );
}

export async function createWorkSessionPopup(team) {
    const _dt = localInputFormat(new Date());
    return (
        await Swal.fire({
            title: `Sitzung erstellen`,
            html: `
            <p>Team: ${team.name}</p><hr />
            <label class="swal2-input-label" for="swal-input-note">Notiz:</label>
            <textarea id="swal-input-note" class="swal2-textarea" placeholder="Notiz"></textarea>
            <label class="swal2-input-label" for="swal-input-dtstart">Von:</label>
            <input type="datetime-local" id="swal-input-dtstart" class="swal2-input" value="${_dt}">
            <label class="swal2-input-label" for="swal-input-dtend">Bis:</label>
            <input type="datetime-local" id="swal-input-dtend" class="swal2-input" value="${_dt}">
        `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Erstellen',
            cancelButtonText: 'Abbrechen',
            preConfirm: async () => {
                const note = (<HTMLInputElement>(
                    document.getElementById('swal-input-note')
                )).value;
                const dtstart = (<HTMLInputElement>(
                    document.getElementById('swal-input-dtstart')
                )).value;
                const dtend = (<HTMLInputElement>(
                    document.getElementById('swal-input-dtend')
                )).value;

                if (!dtstart || !dtend) {
                    Swal.showValidationMessage(
                        'Start- und Endzeit sind Pflichtfelder!'
                    );
                    return false;
                }

                Swal.showLoading();
                return await createWorkSession(team.id, {
                    note,
                    time_start: isoFormat(dtstart),
                    time_end: isoFormat(dtend),
                });
            },
        })
    ).value;
}

// WorkSession edit

export async function editWorkSession(
    teamId: ID,
    sessionId: ID,
    session: WorksessionRequestDTO
) {
    return await WorkingtimeAPI.updateWorksession(
        teamId,
        sessionId,
        session
    ).then(async (data) => {
        requestSuccessAlert(data);
        Cache.getCurrentTeamData().me_worksessions[data.session.id] =
            data.session;
        return data.session;
    });
}

export async function editWorkSessionPopup(team, session: Worksession) {
    let dtstart = localInputFormat(session.time_start);
    let dtend =
        session.time_end !== null ? localInputFormat(session.time_end) : '';
    return (
        await Swal.fire({
            title: `Sitzung bearbeiten`,
            html:
                `
            <p>Team: ${team.name}</p><hr />
            <label class="swal2-input-label" for="swal-input-note">Notiz:</label>
            <textarea id="swal-input-note" class="swal2-textarea" placeholder="Notiz">${session.note}</textarea>` +
                (session.is_created_via_tracking
                    ? '<hr><p class="swal2-text mt-3 mb-0 small opacity-50 px-3">Start- und Endzeit können nur bei manuell erfassten Sitzungen geändert werden.</p>'
                    : `
                    <label class="swal2-input-label" for="swal-input-dtstart">Von:</label>
                    <input type="datetime-local" id="swal-input-dtstart" class="swal2-input" value="${dtstart}">
                    <label class="swal2-input-label" for="swal-input-dtend">Bis:</label>
                    <input type="datetime-local" id="swal-input-dtend" class="swal2-input" value="${dtend}">
                    `),
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Speichern',
            cancelButtonText: 'Abbrechen',
            preConfirm: async () => {
                const note = (<HTMLInputElement>(
                    document.getElementById('swal-input-note')
                )).value;

                if (!session.is_created_via_tracking) {
                    dtstart = (<HTMLInputElement>(
                        document.getElementById('swal-input-dtstart')
                    )).value;
                    dtend = (<HTMLInputElement>(
                        document.getElementById('swal-input-dtend')
                    )).value;
                    if (!dtstart || !dtend) {
                        Swal.showValidationMessage(
                            'Start- und Endzeit sind Pflichtfelder!'
                        );
                        return false;
                    }
                }

                Swal.showLoading();
                return await editWorkSession(team.id, session.id, {
                    note,
                    time_start: isoFormat(dtstart),
                    time_end: isoFormat(dtend),
                });
            },
        })
    ).value;
}

// WorkSession deletion

export async function deleteWorkSession(teamId: ID, sessionId: ID) {
    return await WorkingtimeAPI.deleteWorksession(teamId, sessionId).then(
        (data) => {
            requestSuccessAlert(data);
            delete Cache.getCurrentTeamData().me_worksessions[sessionId];
        }
    );
}

export async function deleteWorkSessionPopup(team, session: Worksession) {
    await confirmAlert(
        'Willst du folgende Sitzung wirklich löschen?<br /><br />' +
            `<b>Notiz:</b> ${session.note}`,
        async () => await deleteWorkSession(team.id, session.id)
    );
}

// Tracking

export async function startTrackingSession(teamId: ID) {
    waitingAlert('Wird gestartet...');
    return await WorkingtimeAPI.startTrackingSession(teamId).then((data) => {
        successAlert('Die Zeitmessung wurde gestartet', 'Tracking gestartet');
        window.appdata.current_worksession = data.session;
        return data.session;
    });
}

export async function getTrackingSession() {
    return await WorkingtimeAPI.getTrackingSession().then((data) => {
        if (data.error) {
            // 'no_active_tracking_session_exists' comes with a 200 code on purpose
            window.appdata.current_worksession = null;
            return null;
        } else {
            window.appdata.current_worksession = data.session;
            Navigation.renderPage();
            return data.session;
        }
    });
}

export async function stopTrackingSession() {
    waitingAlert('Wird gestoppt...');
    return await WorkingtimeAPI.stopTrackingSession().then((data) => {
        successAlert('Die Zeitmessung wurde gestoppt', 'Tracking gestoppt');
        window.appdata.current_worksession = null;
        Cache.getTeamData(data.session._team_id).me_worksessions[
            data.session.id
        ] = data.session;
        return data.session;
    });
}

// Rename session without the date options/text

export async function renameWorkSession(
    teamId: ID,
    sessionId: ID,
    note: string
) {
    return await WorkingtimeAPI.updateWorksession(teamId, sessionId, {
        note,
    }).then((data) => {
        requestSuccessAlert(data);
        if (data.session.id in Cache.getCurrentTeamData().me_worksessions) {
            Cache.getCurrentTeamData().me_worksessions[data.session.id] =
                data.session;
        }
        if (
            window.appdata.current_worksession &&
            window.appdata.current_worksession.id === data.session.id
        ) {
            window.appdata.current_worksession = data.session;
        }
        return data.session;
    });
}

export async function renameWorkSessionPopup(team, session: Worksession) {
    return (
        await Swal.fire({
            title: `Sitzung umbenennen`,
            html: `<textarea id="swal-input-note" class="swal2-textarea" placeholder="Notiz">${session.note}</textarea>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Speichern',
            cancelButtonText: 'Abbrechen',
            preConfirm: async () => {
                const note = <string>$('#swal-input-note').val();

                Swal.showLoading();
                return await renameWorkSession(team.id, session.id, note);
            },
        })
    ).value;
}
