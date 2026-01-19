import { ID } from '@/teamized/interfaces/common';

export interface ClubMemberPortfolio {
    id: ID;
    visible: boolean;
    image1_url: string;
    image2_url: string;
    member_since: number;
    hobby_since: number;
    role: string;
    profession: string;
    hobbies: string;
    highlights: string;
    biography: string;
    contact_email: string;
}

export interface ClubMemberPortfolioRequestDTO {
    visible: boolean;
    image1_url: string;
    image2_url: string;
    member_since: number;
    hobby_since: number;
    role: string;
    profession: string;
    hobbies: string;
    highlights: string;
    biography: string;
    contact_email: string;
}
