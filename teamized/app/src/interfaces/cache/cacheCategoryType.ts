import { Worksession } from '../workingtime/worksession';
import { Member } from '../teams/member';
import { Calendar } from '../calendar/calendar';
import { Invite } from '../teams/invite';
import { Todolist } from '../todolist/todolist';
import { ClubMember } from '../club/clubMember';
import { ClubGroup } from '../club/clubGroup';

export type CacheCategoryType =
    | Calendar
    | Invite
    | Member
    | Todolist
    | Worksession
    | ClubMember
    | ClubGroup;
