import { requestSuccessAlert, confirmAlert, infoAlert, doubleConfirmAlert, waitingAlert } from "./alerts.js";
import * as API from "./api.js";
import * as Navigation from "./navigation.js";
import * as Cache from "./cache.js";
import * as Utils from "./utils.js";

// User profile

export async function getProfile() {
    return await API.GET('profile').then(
        (data) => {
            window.appdata.user = data.user;
            return data.user;
        }
    );
}

// Settings

function applySettings(settings) {
    if (settings.darkmode === true) {
        setColorScheme('dark');
    } else if (settings.darkmode === false) {
        setColorScheme('light');
    } else {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setColorScheme('dark');
        } else {
            setColorScheme('light');
        }
    }
}

export async function getSettings() {
    return await API.GET('settings').then(
        (data) => {
            window.appdata.settings = data.settings;
            applySettings(data.settings);
            return data.settings;
        }
    );
}

export async function editSettings(darkmode) {
    return await API.POST('settings', { darkmode }).then(
        (data) => {
            window.appdata.settings = data.settings;
            applySettings(data.settings);
            return data.settings;
        }
    );
}

// Dark mode

function setColorScheme(scheme) {
    if (scheme === 'dark') {
        $('#app-maincontent').addClass('darkmode');
        $("link#swal-dark")[0].disabled = false;
        $("link#swal-light")[0].disabled = true;
    } else {
        $('#app-maincontent').removeClass('darkmode');
        $("link#swal-light")[0].disabled = false;
        $("link#swal-dark")[0].disabled = true;
    }
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
    const colorScheme = e.matches ? "dark" : "light";

    if (window.appdata.settings.darkmode === null) {
        setColorScheme(colorScheme);
    }
});
