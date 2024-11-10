import { TeamsCache } from './interfaces/cache/teamsCache';
import { Settings } from './interfaces/settings';
import { User } from './interfaces/user';
import { Worksession } from './interfaces/workingtime/worksession';

declare global {
    // noinspection JSUnusedGlobalSymbols
    interface Window {
        _App: unknown;
        api_base_url: string;
        appdata: {
            currentPage: string;
            current_worksession?: Worksession | null;
            debug_prompt_accepted: boolean;
            defaultTeamId: string;
            selectedTeamId: string;
            settings: Settings;
            teamCache: TeamsCache;
            user: User;
            initialLoadComplete: boolean;
            loadInProgress: boolean;
        };
    }
}
