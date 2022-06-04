"use strict";

import { validateUUID } from "../../utils/utils.js";
import { errorAlert } from "../../utils/alerts.js";
import * as Teams from "../../utils/teams.js";
import * as WorkingTime from "../../utils/workingtime.js";
import * as Dashboard from "../dashboard.js";

export default class Page_WorkingTime extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    return (
      <Dashboard.Dashboard
        title="Deine Arbeitszeit"
        subtitle="Erfasse und verwalte deine Arbeitszeit"
      >
        <Dashboard.DashboardColumn size="3">
        <Dashboard.DashboardTile title="Erfassen"></Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>
        <Dashboard.DashboardColumn size="9">
        <Dashboard.DashboardTile title="Erfasste Zeiten"></Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>
      </Dashboard.Dashboard>
    );
  }
}
