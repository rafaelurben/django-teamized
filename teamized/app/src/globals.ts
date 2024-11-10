import { Worksession } from './interfaces/workingtime/worksession';
import { Settings } from './interfaces/settings';
import { TeamsCache } from './interfaces/cache/teamsCache';
import { User } from './interfaces/user';

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
