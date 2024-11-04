/**
 * Various utility functions
 */

import $ from 'jquery';

/**
 * Check if the given UUID is a valid UUID
 *
 * @param {String} uuid
 * @returns {Boolean}
 */
export function validateUUID(uuid) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        uuid
    );
}

/**
 * Pad a number with leading zeros
 *
 * @param {Number} num the number
 * @param {Number} len length to pad to
 * @returns {String} the padded number
 */
export function padZero(num, len) {
    return String(num).padStart(len, '0');
}

/**
 * Toggle the secret debug mode
 *
 * @param {Boolean} noask do not ask the user for confirmation
 */
export function toggleDebug(noask) {
    if ($('body').hasClass('debug')) {
        $('body').removeClass('debug');
    } else {
        if (
            noask === true ||
            window.appdata.debug_prompt_accepted === true ||
            confirm('Möchtest du den DEBUG-Modus aktivieren?')
        ) {
            window.appdata.debug_prompt_accepted = true;
            $('body').addClass('debug');
        }
    }
}
