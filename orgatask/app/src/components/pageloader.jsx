"use strict";

import Page_Home from "./pages/home.js";
import Page_TeamList from "./pages/teamlist.js";
import Page_TeamManage from "./pages/teammanage.js";
import Page_WorkingTime from "./pages/workingtime.js";

import * as Teams from "../utils/teams.js";

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
        let teamdata = Teams.getCurentTeamData();
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
            selectedTeamId={window.orgatask.selectedTeamId}
          />
        );
    }
  }
}
