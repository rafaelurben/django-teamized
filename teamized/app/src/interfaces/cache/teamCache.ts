import { Team } from '../teams/team';
import { Calendar } from '../calendar/calendar';
import { IDIndexedObjectList } from '../common';
import { Invite } from '../teams/invite';
import { Member } from '../teams/member';
import { Todolist } from '../todolist/todolist';
import { Worksession } from '../workingtime/worksession';
import { ClubMember } from '../club/clubMember';
import { ClubGroup } from '../club/clubGroup';
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
    _state: {
        [key in CacheCategory]: {
            _initial: boolean;
            _refreshing: boolean;
        };
    };
}
