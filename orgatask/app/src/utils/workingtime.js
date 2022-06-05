import { successAlert, waitingAlert } from "./alerts.js";
import * as API from "./api.js";
import * as Cache from "./cache.js";
import * as Navigation from "./navigation.js";


export async function getWorkSessionsInTeam(teamId) {
    return await API.GET(`me/worksessions/t=${teamId}`).then(
        (data) => {
            let me = Cache.getMeInTeam(teamId);
            me.worksessions = data.sessions;
            return data.sessions;
        }
    );
}

export async function startTrackingSession(teamId) {
    waitingAlert("Wird gestartet...");
    return await API.POST(`me/worksessions/tracking/start/t=${teamId}`).then(
        (data) => {
            successAlert("Die Zeitmessung wurde gestartet", "Tracking gestartet");
            window.orgatask.current_worksession = data.session;
            return data.session;
        }
    );
}

export async function getTrackingSession() {
    return await API.GET("me/worksessions/tracking/live", {}, "no-error-handling").then(
        (data) => {
            window.orgatask.current_worksession = data.session;
            Navigation.renderPage();
            return data.session;
        }
    ).catch(
        (error) => {
            window.orgatask.current_worksession = null;
            return null;
        }
    );
}

export async function stopTrackingSession() {
    waitingAlert("Wird gestoppt...");
    return await API.POST("me/worksessions/tracking/stop").then(
        (data) => {
            successAlert("Die Zeitmessung wurde gestoppt", "Tracking gestoppt");
            window.orgatask.current_worksession = null;
            let me = Cache.getMeInCurrentTeam();
            me.worksessions = me.worksessions || [];
            me.worksessions.push(data.session);
            return data.session;
        }
    );
}
