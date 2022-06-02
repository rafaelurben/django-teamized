import { successAlert, waitingAlert } from "./alerts.js";
import * as API from "./api.js";

export async function startTrackingSession(teamId) {
    waitingAlert("Wird gestartet...");
    return await API.POST(`teams/${teamId}/worksessions/tracking/start`).then(
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
            return data.session;
        }
    );
}

export async function stopTrackingSession() {
    waitingAlert("Wird gestoppt...");
    return await API.POST("me/worksessions/tracking/stop").then(
        (data) => {
            successAlert("Die Zeitmessung wurde gestoppt", "Tracking gestoppt");
            window.orgatask.current_worksession = undefined;
            return data.session;
        }
    );
}
