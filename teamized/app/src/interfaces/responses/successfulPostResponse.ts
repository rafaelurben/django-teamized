import { Alert } from './alert';
import { ID } from '../common';

export interface SuccessfulPostResponse {
    success: true;
    id: ID;
    alert: Alert;
}
