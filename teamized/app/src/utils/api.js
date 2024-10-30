/**
 * API utils
 */

import $ from 'jquery';

import { ajaxRequestErrorAlert } from './alerts.js';

/**
 * Base request method for all ajax requests
 *
 * @param {String} method (GET, POST, PUT, DELETE)
 * @param {String} endpoint URL
 * @param {object} data
 * @param  {...any} opts additional options passed to $.ajax
 * @returns
 */
export function request(method, endpoint, data, ...opts) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: method,
            url: window.api_base_url + endpoint,
            data: data,
            success: resolve,
            error: (e) => {
                if (!opts.includes('no-error-handling')) {
                    ajaxRequestErrorAlert(e);
                }
                reject(e);
            },
            ...opts,
        });
    });
}

/**
 * Shortcut for request("GET", endpoint, data, ...opts)
 */
export async function GET(endpoint, data, ...opts) {
    return await request('GET', endpoint, data, ...opts);
}

/**
 * Shortcut for request("POST", endpoint, data, ...opts)
 */
export async function POST(endpoint, data, ...opts) {
    return await request('POST', endpoint, data, ...opts);
}

/**
 * Shortcut for request("DELETE", endpoint, data, ...opts)
 */
export async function DELETE(endpoint, data, ...opts) {
    return await request('DELETE', endpoint, data, ...opts);
}
