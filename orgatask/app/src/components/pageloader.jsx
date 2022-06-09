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
        let teamdata = Cache.getCurrentTeamData();
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
            calendars={Cache.getCurrentTeamData().calendars}
            selectedTeamId={window.orgatask.selectedTeamId}
          />
        )
    }
  }
}
