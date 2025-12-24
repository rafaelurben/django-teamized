/**
 * Utils for settings and profile
 */

import * as GeneralAPI from '@/teamized/api/general';
import { render } from '@/teamized/app';
import { Settings } from '@/teamized/interfaces/settings';

// User profile

export async function getProfile() {
    return await GeneralAPI.getProfile().then((user) => {
        window.appdata.user = user;
        return user;
    });
}

// Settings

function applySettings(settings: Settings) {
    window.appdata.settings = settings;
    // Color scheme ('darkmode')
    if (settings.darkmode === true) {
        setColorScheme('dark');
    } else if (settings.darkmode === false) {
        setColorScheme('light');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setColorScheme('dark');
    } else {
        setColorScheme('light');
    }
    // Rerender the page to apply the changes
    render();
}

export async function getSettings() {
    return await GeneralAPI.getSettings().then((settings) => {
        applySettings(settings);
        return settings;
    });
}

/**
 * Set, apply and save new settings
 * @param settings
 */
export async function editSettings(settings: Partial<Settings>) {
    // Apply new settings
    const newSettings = { ...window.appdata.settings, ...settings };
    applySettings(newSettings);
    // Save new settings on server
    return await GeneralAPI.updateSettings(newSettings).then(
        (updatedSettings) => {
            // Reapply settings if the server changed them
            if (updatedSettings !== newSettings) {
                applySettings(updatedSettings);
            }
            return updatedSettings;
        }
    );
}

// Dark mode

/**
 * Update the used color scheme
 *
 * @param {String} scheme "dark" or "light"
 */
function setColorScheme(scheme: string) {
    if (scheme === 'dark') {
        document.body.dataset.tailwindTheme = 'dark';
    } else {
        document.body.dataset.tailwindTheme = 'light';
    }
}

export function getSwalTheme() {
    switch (window.appdata.settings.darkmode) {
        case true:
            return 'dark';
        case false:
            return 'light';
        default:
            return 'auto';
    }
}

window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
        const colorScheme = e.matches ? 'dark' : 'light';

        if (window.appdata.settings.darkmode === null) {
            setColorScheme(colorScheme);
        }
    });
