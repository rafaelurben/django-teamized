import { Appdata } from './interfaces/appdata';

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
        appdata: Appdata;
    }
}
