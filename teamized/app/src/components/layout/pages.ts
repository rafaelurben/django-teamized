const PAGE_CONFIGS: {
    [index: string]: {
        title: string;
        inheritFrom?: string;
        description?: string;
    };
} = {
    home: {
        title: 'Startseite',
        description: 'Herzlich willkommen bei Teamized!',
    },
    teamlist: {
        title: 'Teams',
        description:
            'Verwalte deine Teams, erstelle ein neues oder trete einem bei',
    },
    team: {
        title: 'Team',
        inheritFrom: 'teamlist',
        description: 'Hier findest du Infos über dein ausgewähltes Team',
    },
    workingtime: {
        title: 'Arbeitszeit',
        inheritFrom: 'team',
        description: 'Erfasse und verwalte deine Arbeitszeit',
    },
    calendars: {
        title: 'Kalender',
        inheritFrom: 'team',
        description: 'Übersicht über alle Kalender deines Teams',
    },
    todo: {
        title: 'To-do-Listen',
        inheritFrom: 'team',
        description: 'Verwalte Aufgaben und To-do-Listen für dein Team',
    },
    club: {
        title: 'Verein',
        inheritFrom: 'team',
        description: 'Verwalte deinen Verein und seine Mitglieder',
    },
    club_attendance: {
        title: 'Anwesenheit',
        inheritFrom: 'club',
        description: 'Verwalte die Anwesenheit der Vereinsmitglieder',
    },
};

export type Breadcrumbs = {
    label: string;
    page: string;
    description?: string;
}[];

export function calculateBreadcrumbs(page: string) {
    const breadcrumbs: Breadcrumbs = [];

    function addBreadcrumbsRecursively(pageKey: string) {
        const config = PAGE_CONFIGS[pageKey];
        if (!config) return;

        if (config.inheritFrom) {
            addBreadcrumbsRecursively(config.inheritFrom);
        }

        breadcrumbs.push({
            label: config.title,
            page: pageKey,
            description: config?.description,
        });
    }

    addBreadcrumbsRecursively(page);
    return breadcrumbs;
}
