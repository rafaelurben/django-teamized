import { TeamsCache } from './cache/teamsCache';
import { Settings } from './settings';
import { User } from './user';
import { Worksession } from './workingtime/worksession';

export interface Appdata {
    current_worksession?: Worksession | null;
    debug_prompt_accepted: boolean;
    defaultTeamId: string;
    settings: Settings;
    teamCache: TeamsCache;
    user: User;
    initialLoadComplete: boolean;
    loadInProgress: boolean;
}
