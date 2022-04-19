import { errorAlert } from "./alerts.js";

export function request(method, endpoint, data, ...opts) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: method,
            url: document.api_base_url + endpoint,
            data: data,
            success: resolve,
            error: (e) => {
                if (!opts.includes("no-error-handling")) {
                    errorAlert(e);
                }
                reject(e);
            },
            ...opts
        });
    })
}

export async function get(endpoint, data, ...opts) {
    return await request("GET", endpoint, data, ...opts);
}

export async function post(endpoint, data, ...opts) {
    return await request("POST", endpoint, data, ...opts);
}
