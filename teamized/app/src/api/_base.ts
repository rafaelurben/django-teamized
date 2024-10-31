/**
 * API utils
 */

import * as $ from 'jquery';

import { ajaxRequestErrorAlert } from '../utils/alerts';
import {
    SuccessfulDeleteResponse,
    SuccessfulPostResponse,
    SuccessfulPutResponse,
} from '../interfaces/responses/successfulResponse';

type HTTPRequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
type HTTPRequestOptions = {
    disableErrorAlert?: boolean;
    ajaxOptions?: JQuery.AjaxSettings;
};

declare global {
    interface Window {
        api_base_url: string;
    }
}

/**
 * API base class
 */
export abstract class API {
    /**
     * Base request method for all ajax requests
     *
     * @param {HTTPRequestMethod} method the HTTP method
     * @param {String} endpoint URL
     * @param {object} data the data
     * @param {HTTPRequestOptions} options additional options
     * @returns
     */
    static request<T>(
        method: HTTPRequestMethod,
        endpoint: string,
        data?: object,
        options?: HTTPRequestOptions
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: method,
                url: window.api_base_url + endpoint,
                data: data,
                success: (data) => {
                    resolve(data as T);
                },
                error: (e: JQuery.jqXHR) => {
                    if (!options?.disableErrorAlert) {
                        ajaxRequestErrorAlert(e);
                    }
                    reject(e);
                },
                ...options?.ajaxOptions,
            });
        });
    }

    /**
     * Shortcut for request("GET", ...)
     */
    static async get<T>(endpoint: string, options?: HTTPRequestOptions) {
        return await this.request<T>('GET', endpoint, undefined, options);
    }

    /**
     * Shortcut for request("POST", ...)
     */
    static async post<T>(
        endpoint: string,
        data?: object,
        options?: HTTPRequestOptions
    ) {
        return await this.request<T & SuccessfulPostResponse>(
            'POST',
            endpoint,
            data,
            options
        );
    }

    /**
     * Shortcut for request("PUT", ...)
     */
    static async put<T>(
        endpoint: string,
        data: object,
        options?: HTTPRequestOptions
    ) {
        return await this.request<T & SuccessfulPutResponse>(
            'POST', // this is intentional because Django doesn't like PUT
            endpoint,
            data,
            options
        );
    }

    /**
     * Shortcut for request("DELETE", ...)
     */
    static async delete<T>(endpoint: string, options?: HTTPRequestOptions) {
        return await this.request<T & SuccessfulDeleteResponse>(
            'DELETE',
            endpoint,
            undefined,
            options
        );
    }
}
