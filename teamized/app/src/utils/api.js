import { ajaxRequestErrorAlert } from "./alerts.js";

export function request(method, endpoint, data, ...opts) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: method,
            url: document.api_base_url + endpoint,
            data: data,
            success: resolve,
            error: (e) => {
                if (!opts.includes("no-error-handling")) {
                    ajaxRequestErrorAlert(e);
                }
                reject(e);
            },
            ...opts
        });
    })
}

export async function GET(endpoint, data, ...opts) {
    return await request("GET", endpoint, data, ...opts);
}

export async function POST(endpoint, data, ...opts) {
    return await request("POST", endpoint, data, ...opts);
}

export async function DELETE(endpoint, data, ...opts) {
    return await request("DELETE", endpoint, data, ...opts);
}
