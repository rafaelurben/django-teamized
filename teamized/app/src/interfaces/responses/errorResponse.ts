import { Alert } from './alert';

export type ErrorResponse =
    | {
          error: string;
          message: string;
          alert?: undefined;
      }
    | {
          error: string;
          message?: undefined;
          alert: Alert;
      };
