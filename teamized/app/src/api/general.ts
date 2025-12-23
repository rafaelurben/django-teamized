/**
 * Teamized General API
 */

import { Settings } from '@/teamized/interfaces/settings';
import { User } from '@/teamized/interfaces/user';

import { API } from './_base';

// User

export async function getProfile() {
    return await API.get<{ user: User }>('profile').then((data) => {
        return data.user;
    });
}

// Settings

export async function getSettings() {
    return await API.get<{ settings: Settings }>('settings').then((data) => {
        return data.settings;
    });
}

export async function updateSettings(settings: Settings) {
    return await API.put<{ settings: Settings }>('settings', settings).then(
        (data) => {
            return data.settings;
        }
    );
}
