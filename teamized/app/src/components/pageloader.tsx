/**
 *  This component is used to render the pages.
 */

import React, { lazy, Suspense } from 'react';

import * as TeamsService from '../service/teams.service';
import { useAppdata } from '../utils/appdataProvider';
import {
    useCurrentTeamData,
    useNavigationState,
} from '../utils/navigation/navigationProvider';

const CalendarsPage = lazy(() => import('./pages/calendars/calendarsPage'));
const ClubPage = lazy(() => import('./pages/club/clubPage'));
const ClubAttendancePage = lazy(
    () => import('./pages/club_attendance/clubAttendancePage')
);
const HomePage = lazy(() => import('./pages/home/homePage'));
const TeamPage = lazy(() => import('./pages/team/teamPage'));
const TeamlistPage = lazy(() => import('./pages/teamlist/teamlistPage'));
const TodoPage = lazy(() => import('./pages/todo/todoPage'));
const WorkingtimePage = lazy(
    () => import('./pages/workingtime/workingtimePage')
);

export const PAGE_NAMES: { [index: string]: string | undefined } = {
    home: 'Startseite',
    club: 'Verein',
    club_attendance: 'Anwesenheit',
    calendars: 'Kalender',
    team: 'Team',
    teamlist: 'Teams',
    workingtime: 'Arbeitszeit',
    todo: 'To-do-Listen',
};

export function PageLoader() {
    const appdata = useAppdata();

    const { selectedPage } = useNavigationState();
    const teamData = useCurrentTeamData();

    if (!teamData) {
        return (
            <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center">
                <div className="spinner-border mb-3" role="status">
                    <span className="visually-hidden">Laden...</span>
                </div>
                <p>Daten werden abgerufen...</p>
            </div>
        );
    }

    const pageName = PAGE_NAMES[selectedPage] || '404 Nicht gefunden';
    document.title = `${pageName} - ${teamData.team.name} | Teamized App`;

    if (selectedPage.startsWith('club') && teamData.team.club === null) {
        return (
            <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
                <div className="text-danger mb-4" role="status">
                    <i className="fa-solid fa-triangle-exclamation fa-3x"></i>
                </div>
                <p>
                    Die Vereinsfunktionen sind in diesem Team noch nicht
                    aktiviert! Bitte wähle ein anderes Team oder eine andere
                    Seite.
                </p>
            </div>
        );
    }

    const getPage = () => {
        switch (selectedPage) {
            case 'home':
                return (
                    <HomePage user={appdata.user} settings={appdata.settings} />
                );
            case 'teamlist':
                return <TeamlistPage teams={TeamsService.getTeamsList()} />;
            case 'team':
                return <TeamPage />;
            case 'workingtime':
                return <WorkingtimePage />;
            case 'calendars':
                return <CalendarsPage />;
            case 'todo':
                return <TodoPage />;
            case 'club':
                return <ClubPage />;
            case 'club_attendance':
                return <ClubAttendancePage />;
            default:
                return (
                    <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
                        <div className="text-danger mb-4" role="status">
                            <i className="fa-solid fa-triangle-exclamation fa-3x"></i>
                        </div>
                        <h3>404 Nicht gefunden</h3>
                        <p>
                            Diese Seite wurde leider nicht gefunden. Vielleicht
                            findest du die gesuchte Seite ja links in der
                            Navigation?
                        </p>
                    </div>
                );
        }
    };

    return (
        <Suspense
            fallback={
                <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center">
                    <div className="spinner-border mb-3" role="status">
                        <span className="visually-hidden">Laden...</span>
                    </div>
                    <p>Seite wird geladen...</p>
                </div>
            }
        >
            {getPage()}
        </Suspense>
    );
}
