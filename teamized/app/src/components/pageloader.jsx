"use strict";

import Page_Calendars from "./pages/calendars.js";
import Page_Club from "./pages/club.js";
import Page_Home from "./pages/home.js";
import Page_TeamList from "./pages/teamlist.js";
import Page_Team from "./pages/team.js";
import Page_ToDo from "./pages/todo.js";
import Page_WorkingTime from "./pages/workingtime.js";

import * as Teams from "../utils/teams.js";
import * as Cache from "../utils/cache.js";

/*
    This component is used to render the pages.
*/

export const PAGELIST = [
    "home",
    "club",
    "calendars",
    "team",
    "teamlist",
    "workingtime",
    "todo",
]

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
    };

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
