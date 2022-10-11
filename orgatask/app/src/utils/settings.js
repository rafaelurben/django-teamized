import * as API from "./api.js";
import * as Navigation from "./navigation.js";

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
    window.appdata.settings = settings;
    // Color scheme ('darkmode')
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
    // Rerender the page to apply the changes
    Navigation.render();
}

export async function getSettings() {
    return await API.GET('settings').then(
        (data) => {
            applySettings(data.settings);
            return data.settings;
        }
    );
}

export async function editSettings(settings) {
    // Apply new settings
    let newsettings = { ...window.appdata.settings, ...settings };
    applySettings(newsettings);
    // Save new settings on server
    return await API.POST('settings', settings).then(
        (data) => {
            // Reapply settings if the server changed them
            if (data.settings !== newsettings) {
                applySettings(data.settings);
            }
            return data.settings;
        }
    );
}

// Dark mode

function setColorScheme(scheme) {
    if (scheme === 'dark') {
        $('#app-maincontent').addClass('darkmode');
        // Disabling CSS files might not work in all browsers, but this should switch the SweetAlert stylesheet
        $("link#swal-dark")[0].disabled = false;
        $("link#swal-light")[0].disabled = true;
    } else {
        $('#app-maincontent').removeClass('darkmode');
        // Disabling CSS files might not work in all browsers, but this should switch the SweetAlert stylesheet
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
