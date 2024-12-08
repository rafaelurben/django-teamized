import { TeamsCache } from './interfaces/cache/teamsCache';
import { Settings } from './interfaces/settings';
import { User } from './interfaces/user';
import { Worksession } from './interfaces/workingtime/worksession';

declare global {
    // noinspection JSUnusedGlobalSymbols
    interface Window {
        _App: unknown;
        teamized_globals: {
            api_base_url: string;
            logout_url: string;
            debug_url: string;
            account_url: string;
            home_url: string;
        };
        appdata: {
            current_worksession?: Worksession | null;
            debug_prompt_accepted: boolean;
            defaultTeamId: string;
            settings: Settings;
            teamCache: TeamsCache;
            user: User;
            initialLoadComplete: boolean;
            loadInProgress: boolean;
        };
    }
}
