import { ID } from '../../interfaces/common';

export interface NavigationState {
    selectedPage: string;
    selectedTeamId: ID;
    [index: string]: string;
}

interface NavigationStateUpdate {
    type?: 'update';
    update?: Partial<NavigationState>;
    remove?: (keyof NavigationState)[];
}

interface NavigationStateReplace {
    type: 'replace';
    state: NavigationState;
}

export type NavigationStateChange =
    | NavigationStateUpdate
    | NavigationStateReplace;
