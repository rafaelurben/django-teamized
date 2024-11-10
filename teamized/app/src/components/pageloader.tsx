/**
 *  This component is used to render the pages.
 */

import React from 'react';

import * as Cache from '../utils/cache';
import * as Teams from '../utils/teams';
import CalendarsPage from './pages/calendars/calendarsPage';
import ClubPage from './pages/club/clubPage';
import HomePage from './pages/home/homePage';
import Page_Team from './pages/team/teamPage';
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

export const PAGE_LIST = Object.keys(PAGE_NAMES);

interface Props {
    page: string;
}

export function PageLoader({ page }: Props) {
    const teamData = Cache.getCurrentTeamData();

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

    if (page.startsWith('club') && teamData.team.club === null) {
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

    switch (page) {
        case 'home':
            return (
                <HomePage
                    user={window.appdata.user}
                    settings={window.appdata.settings}
                />
            );
        case 'teamlist':
            return (
                <TeamlistPage
                    teams={Teams.getTeamsList()}
                    selectedTeamId={window.appdata.selectedTeamId}
                />
            );
        case 'team':
            return <Page_Team team={teamData.team} />;
        case 'workingtime':
            return <WorkingtimePage team={teamData.team} />;
        case 'calendars':
            return <CalendarsPage team={teamData.team} />;
        case 'todo':
            return <TodoPage team={teamData.team} />;
        case 'club':
            return <ClubPage team={teamData.team} />;
    }
}
