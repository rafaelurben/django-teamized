'use strict';

import React from 'react';

import CalendarsPage from './pages/calendars/calendarsPage.tsx';
import ClubPage from './pages/club/clubPage.tsx';
import HomePage from './pages/home/homePage.tsx';
import TeamlistPage from './pages/teamlist/teamlistPage.tsx';
import Page_Team from './pages/team/teamPage.tsx';
import TodoPage from './pages/todo/todoPage.tsx';
import WorkingtimePage from './pages/workingtime/workingtimePage.tsx';

import * as Teams from '../utils/teams';
import * as Cache from '../utils/cache.ts';

/*
    This component is used to render the pages.
*/

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

export class PageLoader extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const teamData = Cache.getCurrentTeamData();

        if (teamData === null) {
            return (
                <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center">
                    <div className="spinner-border mb-3" role="status">
                        <span className="visually-hidden">Laden...</span>
                    </div>
                    <p>Daten werden abgerufen...</p>
                </div>
            );
        }
        if (this.props.page.startsWith('club') && teamData.team.club === null) {
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

        switch (this.props.page) {
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
                return (
                    <ClubPage
                        team={teamData.team}
                        isAdmin={Teams.isCurrentTeamAdmin()}
                    />
                );
        }
    }
}
