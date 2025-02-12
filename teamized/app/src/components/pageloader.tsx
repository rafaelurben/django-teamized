/**
 *  This component is used to render the pages.
 */

import React from 'react';

import * as TeamsService from '../service/teams.service';
import { useAppdata } from '../utils/appdataProvider';
import {
    useCurrentTeamData,
    useNavigationState,
} from '../utils/navigation/navigationProvider';
import CalendarsPage from './pages/calendars/calendarsPage';
import ClubPage from './pages/club/clubPage';
import HomePage from './pages/home/homePage';
import TeamPage from './pages/team/teamPage';
import TeamlistPage from './pages/teamlist/teamlistPage';
import TodoPage from './pages/todo/todoPage';
import WorkingtimePage from './pages/workingtime/workingtimePage';

export const PAGE_NAMES = {
    home: 'Startseite',
    club: 'Verein',
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

    switch (selectedPage) {
        case 'home':
            return <HomePage user={appdata.user} settings={appdata.settings} />;
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
}
