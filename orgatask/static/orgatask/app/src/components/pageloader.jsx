"use strict";

import Page_TeamList from "./pages/teamlist.js";
import Page_TeamManage from "./pages/teammanage.js";

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
            team={null}
            members={null}
            invites={null}
          />
        );
    }
  }
}
