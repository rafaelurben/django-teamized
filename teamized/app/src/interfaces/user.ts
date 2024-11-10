import { ID } from './common';

export interface User {
    id: ID;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
}
