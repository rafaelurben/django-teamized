import { Calendar } from '../calendar/calendar';
import { ClubGroup } from '../club/clubGroup';
import { ClubMember } from '../club/clubMember';
import { ClubPresenceEvent } from '../club/clubPresenceEvent';
import { Invite } from '../teams/invite';
import { Member } from '../teams/member';
import { Todolist } from '../todolist/todolist';
import { Worksession } from '../workingtime/worksession';

export type CacheCategoryType =
    | Calendar
    | Invite
    | Member
    | Todolist
    | Worksession
    | ClubMember
    | ClubGroup
    | ClubPresenceEvent;
