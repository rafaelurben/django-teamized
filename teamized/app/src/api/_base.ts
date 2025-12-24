/**
 * API utils
 */

import $ from 'jquery';

import {
    SuccessfulDeleteResponse,
    SuccessfulGetResponse,
    SuccessfulPostResponse,
    SuccessfulPutResponse,
    SuccessfulResponse,
} from '@/teamized/interfaces/responses/successfulResponse';
import {
    apiRequestErrorAlert,
    apiRequestSuccessAlert,
} from '@/teamized/utils/alerts';

type HTTPRequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
type HTTPRequestOptions = {
    disableErrorAlert?: boolean;
    disableSuccessAlert?: boolean;
    ajaxOptions?: JQuery.AjaxSettings;
};

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
    static request<T extends SuccessfulResponse>(
        method: HTTPRequestMethod,
        endpoint: string,
        data?: object,
        options?: HTTPRequestOptions
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: method,
                url: window.teamized_globals.api_base_url + endpoint,
                data: data,
                success: (data: T) => {
                    if (!options?.disableSuccessAlert && data.alert) {
                        apiRequestSuccessAlert(data);
                    }
                    resolve(data);
                },
                error: (err: JQuery.jqXHR) => {
                    if (!options?.disableErrorAlert) {
                        apiRequestErrorAlert(err);
                    }
                    reject(err);
                },
                ...options?.ajaxOptions,
            });
        });
    }

    /**
     * Shortcut for request("GET", ...)
     */
    static async get<T>(endpoint: string, options?: HTTPRequestOptions) {
        return await this.request<T & SuccessfulGetResponse>(
            'GET',
            endpoint,
            undefined,
            options
        );
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
