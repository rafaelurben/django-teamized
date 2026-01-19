import { JSX, lazy, LazyExoticComponent } from 'react';

const CalendarsEventsPage = lazy(
    () =>
        import('@/teamized/components/pages/calendars_events/calendarsEventsPage')
);
const CalendarsManagePage = lazy(
    () =>
        import('@/teamized/components/pages/calendars_manage/calendarsManagePage')
);
const ClubPage = lazy(
    () => import('@/teamized/components/pages/club/clubPage')
);
const ClubAttendancePage = lazy(
    () =>
        import('@/teamized/components/pages/club_attendance/clubAttendancePage')
);
const HomePage = lazy(
    () => import('@/teamized/components/pages/home/homePage')
);
const TeamPage = lazy(
    () => import('@/teamized/components/pages/team/teamPage')
);
const TeamlistPage = lazy(
    () => import('@/teamized/components/pages/teamlist/teamlistPage')
);
const TodoPage = lazy(
    () => import('@/teamized/components/pages/todo/todoPage')
);
const WorkingtimePage = lazy(
    () => import('@/teamized/components/pages/workingtime/workingtimePage')
);

export const PAGE_CONFIGS: {
    [index: string]: {
        title: string;
        inheritFrom?: string;
        description?: string;
        canHandleNoTeamData?: boolean;
        component: LazyExoticComponent<() => JSX.Element>;
    };
} = {
    home: {
        title: 'Startseite',
        description: 'Herzlich willkommen bei Teamized!',
        canHandleNoTeamData: true,
        component: HomePage,
    },
    teamlist: {
        title: 'Teams',
        description:
            'Verwalte deine Teams, erstelle ein neues oder trete einem bei',
        component: TeamlistPage,
        canHandleNoTeamData: true,
    },
    team: {
        title: 'Team',
        inheritFrom: 'teamlist',
        description: 'Hier findest du Infos über dein ausgewähltes Team',
        component: TeamPage,
    },
    workingtime: {
        title: 'Arbeitszeit',
        inheritFrom: 'team',
        description: 'Erfasse und verwalte deine Arbeitszeit',
        component: WorkingtimePage,
    },
    calendars_events: {
        title: 'Kalender',
        inheritFrom: 'team',
        description: 'Verwalte Ereignisse in Kalendern deines Teams',
        component: CalendarsEventsPage,
    },
    calendars_manage: {
        title: 'Kalender verwalten',
        inheritFrom: 'team',
        description: 'Verwalte alle Kalender deines Teams',
        component: CalendarsManagePage,
    },
    todo: {
        title: 'To-do-Listen',
        inheritFrom: 'team',
        description: 'Verwalte Aufgaben und To-do-Listen für dein Team',
        component: TodoPage,
    },
    club: {
        title: 'Verein',
        inheritFrom: 'team',
        description: 'Verwalte deinen Verein und seine Mitglieder',
        component: ClubPage,
    },
    club_attendance: {
        title: 'Anwesenheit',
        inheritFrom: 'club',
        description: 'Verwalte die Anwesenheit der Vereinsmitglieder',
        component: ClubAttendancePage,
    },
};
