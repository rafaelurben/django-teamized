"use strict";

import Page_TeamList from "./pages/teamlist.js";


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
        return <Page_TeamList teams={this.props.data.teams} selectedTeamId={this.props.data.selectedTeamId} />;
      case "settings":
        return null;
    }
  }
}
