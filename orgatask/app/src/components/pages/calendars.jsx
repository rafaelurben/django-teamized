"use strict";

import * as Calendars from "../../utils/calendars.js";
import * as Cache from "../../utils/cache.js";

import * as Dashboard from "../dashboard.js";

export default class Page_WorkingTime extends React.Component {
  constructor(props) {
    super(props);

    this.state = { selectedCalendarId: null };
  }

  render() {
    let calendarSelectOptions = [];
    if (this.props.calendars.hasOwnProperty("_initial")) {
      Cache.refreshTeamCacheCategory(this.props.selectedTeamId, "calendars");
      calendarSelectOptions.push(<option key="0" value="0">Laden...</option>);
    } else if (Object.keys(this.props.calendars).length === 0) {
      calendarSelectOptions.push(<option key="0" value="0">Keine Kalender vorhanden</option>);
    } else {
      calendarSelectOptions = Object.entries(this.props.calendars).map(
        ([calId, calendar]) => (
          <option key={calId} value={calId}>
            {calendar.name}
          </option>
        )
      );
    }

    return (
      <Dashboard.Dashboard
        title="Kalender"
        subtitle="(w.i.p.) Kalender für dich und dein Team."
      >
        <Dashboard.DashboardColumn sizes={{ lg: 6 }}>
          <Dashboard.DashboardTile title="Übersicht"></Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>
        <Dashboard.DashboardColumn sizes={{ lg: 6 }}>
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
            <select
              className="form-select"
              onSelect={(calId) => {
                this.setState({ selectedCalendarId: calId });
              }}
            >
              {calendarSelectOptions}
            </select>
          </Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>
      </Dashboard.Dashboard>
    );
  }
}
