"use strict";

import * as Calendars from "../../utils/calendars.js";
import * as Cache from "../../utils/cache.js";
import * as Navigation from "../../utils/navigation.js";

import * as Dashboard from "../dashboard.js";

class CalendarManager extends React.Component {
  constructor(props) {
    super(props);
  }
}

export default class Page_WorkingTime extends React.Component {
  constructor(props) {
    super(props);
    this.getCalendar = this.getCalendar.bind(this);
    this.handleCalendarSelect = this.handleCalendarSelect.bind(this);

    this.createCalendar = this.createCalendar.bind(this);
    this.editCalendar = this.editCalendar.bind(this);
    this.deleteCalendar = this.deleteCalendar.bind(this);

    this.state = { selectedCalendarId: null };
  }

  getCalendar() {
    return Cache.getCurrentTeamData().calendars[this.state.selectedCalendarId];
  }

  handleCalendarSelect(event) {
    let calId = event.target.value;
    this.setState({ selectedCalendarId: calId });
  }

  async createCalendar() {
    const calendar = await Calendars.createCalendarPopup(this.props.team).then(Navigation.renderPage)
    this.setState({ selectedCalendarId: calendar.id });
  }

  async editCalendar() {
    const calendar = this.getCalendar();
    await Calendars.editCalendarPopup(this.props.team, calendar).then(Navigation.renderPage)
  }

  async deleteCalendar() {
    const calendar = this.getCalendar();
    await Calendars.deleteCalendarPopup(this.props.team, calendar);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.team !== this.props.team || prevProps.calendars !== this.props.calendars) {
      let calId = Object.keys(this.props.calendars)[0] || null;
      this.setState({ selectedCalendarId: calId });
    }
  }

  render() {
    let calendarSelectOptions = [];
    if (Cache.getCurrentTeamData()._state.calendars._initial) {
      Cache.refreshTeamCacheCategory(this.props.team.id, "calendars");
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

    let calendar = this.getCalendar();

    let calendarPanelButtons = [];
    if (this.props.isAdmin) {
      calendarPanelButtons.push(
        <button key="create" className="btn btn-outline-success" onClick={this.createCalendar}>Neu erstellen</button>
      );
      if (calendar !== undefined) {
        calendarPanelButtons.push(
          <button key="edit" className="btn btn-outline-dark mx-2" onClick={this.editCalendar}>Bearbeiten</button>
        );
        calendarPanelButtons.push(
          <button key="delete" className="btn btn-outline-danger" onClick={this.deleteCalendar}>Löschen</button>
        );
      }
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
              className="form-select mb-2"
              onInput={this.handleCalendarSelect}
            >
              {calendarSelectOptions}
            </select>
            {calendar !== undefined ? (
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <th>Name:</th>
                    <td>{calendar.name}</td>
                  </tr>
                  <tr>
                    <th>Beschreibung:</th>
                    <td>{calendar.description}</td>
                  </tr>
                  <tr>
                    <th>Abonnieren:</th>
                    <td>
                      <a href={"webcal://"+calendar.ics_url.split("//")[1]}>Webcal</a>
                    </td>
                  </tr>
                  <tr>
                    <th>Farbe:</th>
                    <td>
                      <i
                        style={{ color: calendar.color }}
                        className="fas fa-circle small"
                      ></i>
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : null}
            {calendarPanelButtons}
          </Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>
      </Dashboard.Dashboard>
    );
  }
}
