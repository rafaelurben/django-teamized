import { Calendar } from '@/teamized/interfaces/calendar/calendar';
import { ClubAttendanceEvent } from '@/teamized/interfaces/club/clubAttendanceEvent';
import { ClubGroup } from '@/teamized/interfaces/club/clubGroup';
import { ClubMember } from '@/teamized/interfaces/club/clubMember';
import { IDIndexedObjectList } from '@/teamized/interfaces/common';
import { Invite } from '@/teamized/interfaces/teams/invite';
import { Member } from '@/teamized/interfaces/teams/member';
import { Team } from '@/teamized/interfaces/teams/team';
import { Todolist } from '@/teamized/interfaces/todolist/todolist';
import { Worksession } from '@/teamized/interfaces/workingtime/worksession';

import { CacheCategory } from './cacheCategory';

export interface TeamCache {
    team: Team;
    calendars: IDIndexedObjectList<Calendar>;
    invites: IDIndexedObjectList<Invite>;
    members: IDIndexedObjectList<Member>;
    todolists: IDIndexedObjectList<Todolist>;
    me_worksessions: IDIndexedObjectList<Worksession>;
    club_members: IDIndexedObjectList<ClubMember>;
    club_groups: IDIndexedObjectList<ClubGroup>;
    club_attendance_events: IDIndexedObjectList<ClubAttendanceEvent>;
    _state: {
        [key in CacheCategory]: {
            _initial: boolean;
            _refreshing: boolean;
        };
    };
}
