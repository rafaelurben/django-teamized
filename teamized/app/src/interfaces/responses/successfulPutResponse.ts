import { Alert } from './alert';
import { ID } from '../common';

export interface SuccessfulPutResponse {
    success: true;
    id: ID;
    alert: Alert;
}
