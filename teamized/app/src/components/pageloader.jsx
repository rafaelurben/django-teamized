"use strict";

import React from "react";

import Page_Calendars from "./pages/calendars.jsx";
import Page_Club from "./pages/club.jsx";
import Page_Home from "./pages/home.jsx";
import Page_TeamList from "./pages/teamlist.jsx";
import Page_Team from "./pages/team.jsx";
import Page_ToDo from "./pages/todo.jsx";
import Page_WorkingTime from "./pages/workingtime.jsx";

import * as Teams from "../utils/teams.js";
import * as Cache from "../utils/cache.js";

/*
    This component is used to render the pages.
*/

export const PAGE_NAMES = {
    "home": "Startseite",
    "club": "Verein",
    "calendars": "Kalender",
    "team": "Team",
    "teamlist": "Teams",
    "workingtime": "Arbeitszeit",
    "todo": "To-do-Listen",
}

export const PAGE_LIST = Object.keys(PAGE_NAMES);

export class PageLoader extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const teamdata = Cache.getCurrentTeamData();

        if (teamdata === null) {
            return (
                <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center">
                    <div className="spinner-border mb-3" role="status">
                        <span className="visually-hidden">Laden...</span>
                    </div>
                    <p>Daten werden abgerufen...</p>
                </div>
            );
        }
        ;

        if (this.props.page.startsWith("club") && teamdata.team.club === null) {
            return (
                <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
                    <div className="text-danger mb-4" role="status">
                        <i className="fa-solid fa-triangle-exclamation fa-3x"></i>
                    </div>
                    <p>
                        Die Vereinsfunktionen sind in diesem Team noch nicht aktiviert!
                        Bitte wähle ein anderes Team oder eine andere Seite.
                    </p>
                </div>
            );
        }

        switch (this.props.page) {
            case "home":
                return (
                    <Page_Home
                        user={window.appdata.user}
                        settings={window.appdata.settings}
                    />
                );
            case "teamlist":
                return (
                    <Page_TeamList
                        teams={Teams.getTeamsList()}
                        selectedTeamId={window.appdata.selectedTeamId}
                    />
                );
            case "team":
                return (
                    <Page_Team
                        team={teamdata.team}
                        members={teamdata.members}
                        invites={teamdata.invites}
                    />
                );
            case "workingtime":
                return (
                    <Page_WorkingTime
                        current_worksession={window.appdata.current_worksession}
                        worksessions={teamdata.me_worksessions}
                        selectedTeamId={window.appdata.selectedTeamId}
                        selectedTeam={teamdata.team}
                    />
                );
            case "calendars":
                return (
                    <Page_Calendars
                        team={teamdata.team}
                        calendars={teamdata.calendars}
                        isAdmin={Teams.isCurrentTeamAdmin()}
                    />
                );
            case "todo":
                return (
                    <Page_ToDo
                        team={teamdata.team}
                        todolists={teamdata.todolists}
                        isAdmin={Teams.isCurrentTeamAdmin()}
                    />
                );
            case "club":
                return (
                    <Page_Club
                        team={teamdata.team}
                        isAdmin={Teams.isCurrentTeamAdmin()}
                    />
                );
        }
    }
}
