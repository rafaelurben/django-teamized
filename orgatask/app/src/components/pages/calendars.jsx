"use strict";

import { errorAlert } from "../../utils/alerts.js";
import * as Navigation from "../../utils/navigation.js";
import * as Calendars from "../../utils/calendars.js";
import * as Dashboard from "../dashboard.js";

export default class Page_WorkingTime extends React.Component {
  constructor(props) {
    super(props);
    this.fetchCalendars = this.fetchCalendars.bind(this);

    this.state = { selectedCalendarId: null };

    this.fetch_in_progress = false;

  }

  fetchCalendars() {
    if (!this.fetch_in_progress) {
      this.fetch_in_progress = true;
      Calendars.getCalendars(this.props.selectedTeamId).then(() => {
        Navigation.renderPage();
        this.fetch_in_progress = false;
      })
    }
  }

  render() {
    if (this.props.calendars === undefined) {
      this.fetchCalendars();
    } else if (this.props.calendars.length === 0) {
    } else {
    }

    return (
      <Dashboard.Dashboard
        title="Kalender"
        subtitle="(w.i.p.) Kalender für dich und dein Team."
      >
        <Dashboard.DashboardColumn sizes={{lg: 6}}>
          <Dashboard.DashboardTile title="Übersicht">
          </Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>
        <Dashboard.DashboardColumn sizes={{lg: 6}}>
          <Dashboard.DashboardTile title="Ereignisse">
            {/* Events from the selected day & Create new event button */}
            <p>Kein Tag ausgewählt</p>
          </Dashboard.DashboardTile>
          <Dashboard.DashboardTile title="Ausgewähltes Ereignis">
            {/* Selected event */}
            <p>Kein Ereignis ausgewählt</p>
          </Dashboard.DashboardTile>
          <Dashboard.DashboardTile title="Kalender">
            {/* Selecting, creating and managing calendars */}
          </Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>
      </Dashboard.Dashboard>
    );
  }
}
