import { ID } from '../common';
import { Alert } from './alert';

export interface SuccessfulResponse {
    success: true;
    alert: Alert;
}

export interface SuccessfulPostResponse extends SuccessfulResponse {
    id: ID;
}

export interface SuccessfulPutResponse extends SuccessfulResponse {
    id: ID;
}

export interface SuccessfulDeleteResponse extends SuccessfulResponse {}
