import { ID } from '../common';
import { Alert } from './alert';

export interface SuccessfulResponse {
    success: true | undefined;
    alert?: Alert;
}

export interface SuccessfulGetResponse extends SuccessfulResponse {}

export interface SuccessfulPostResponse extends SuccessfulResponse {
    success: true;
    alert: Alert;
    id: ID;
}

export interface SuccessfulPutResponse extends SuccessfulResponse {
    success: true;
    alert: Alert;
    id: ID;
}

export interface SuccessfulDeleteResponse extends SuccessfulResponse {
    success: true;
    alert: Alert;
}
