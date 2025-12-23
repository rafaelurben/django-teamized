import { Calendar } from '@/teamized/interfaces/calendar/calendar';
import { ClubAttendanceEvent } from '@/teamized/interfaces/club/clubAttendanceEvent';
import { ClubGroup } from '@/teamized/interfaces/club/clubGroup';
import { ClubMember } from '@/teamized/interfaces/club/clubMember';
import { Invite } from '@/teamized/interfaces/teams/invite';
import { Member } from '@/teamized/interfaces/teams/member';
import { Todolist } from '@/teamized/interfaces/todolist/todolist';
import { Worksession } from '@/teamized/interfaces/workingtime/worksession';

export type CacheCategoryType =
    | Calendar
    | Invite
    | Member
    | Todolist
    | Worksession
    | ClubMember
    | ClubGroup
    | ClubAttendanceEvent;
