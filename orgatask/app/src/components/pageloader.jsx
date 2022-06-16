"use strict";

import Page_Calendars from "./pages/calendars.js";
import Page_Home from "./pages/home.js";
import Page_TeamList from "./pages/teamlist.js";
import Page_TeamManage from "./pages/teammanage.js";
import Page_WorkingTime from "./pages/workingtime.js";

import * as Teams from "../utils/teams.js";
import * as Cache from "../utils/cache.js";

/*
    This component is used to render the pages.
*/

export default class PageLoader extends React.Component {
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
          <p>Teams werden geladen...</p>
        </div>
      );
    };

    switch (this.props.page) {
      case "home":
        return (
          <Page_Home 
            user={window.orgatask.user} 
          />
        );
      case "teamlist":
        return (
          <Page_TeamList
            teams={Teams.getTeamsList()}
            selectedTeamId={window.orgatask.selectedTeamId}
          />
        );
      case "teammanage":
        return (
          <Page_TeamManage
            team={teamdata.team}
            members={teamdata.members}
            invites={teamdata.invites}
          />
        );
      case "workingtime":
        return (
          <Page_WorkingTime
            current_worksession={window.orgatask.current_worksession}
            worksessions={Cache.getMeInCurrentTeam().worksessions}
            selectedTeamId={window.orgatask.selectedTeamId}
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
    }
  }
}
