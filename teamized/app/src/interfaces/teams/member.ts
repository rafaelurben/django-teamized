import { ID } from '@/teamized/interfaces/common';
import { User } from '@/teamized/interfaces/user';

export interface Member {
    id: ID;
    role: string;
    role_text: string;
    is_admin: boolean;
    is_owner: boolean;
    user: User;
}

export interface MemberRequestDTO {
    role: string;
}
