"use strict";

import * as Calendars from "../../utils/calendars.js";
import * as Cache from "../../utils/cache.js";
import * as Navigation from "../../utils/navigation.js";

import * as Dashboard from "../dashboard.js";
import {HoverInfo} from "../utils.js";

class CalendarManager extends Dashboard.DashboardTile {
  constructor(props) {
    super(props);

    this.getCalendar = this.getCalendar.bind(this);
    this.getValidCalendarIdOrNull = this.getValidCalendarIdOrNull.bind(this);
    this.handleCalendarSelect = this.handleCalendarSelect.bind(this);

    this.createCalendar = this.createCalendar.bind(this);
    this.editCalendar = this.editCalendar.bind(this);
    this.deleteCalendar = this.deleteCalendar.bind(this);

    this.state = { selectedCalendarId: this.getValidCalendarIdOrNull() };
  }

  getCalendar() {
    return Cache.getCurrentTeamData().calendars[this.state.selectedCalendarId];
  }

  getValidCalendarIdOrNull() {
    return Object.keys(this.props.calendars)[0] || null;
  }
  
  handleCalendarSelect(event) {
    let calId = event.target.value;
    this.setState({ selectedCalendarId: calId });
  }

  async createCalendar() {
    const calendar = await Calendars.createCalendarPopup(this.props.team).then(
      Navigation.renderPage
    );
    this.setState({ selectedCalendarId: calendar.id });
  }

  async editCalendar() {
    const calendar = this.getCalendar();
    await Calendars.editCalendarPopup(this.props.team, calendar).then(
      Navigation.renderPage
    );
  }

  async deleteCalendar() {
    const calendar = this.getCalendar();
    await Calendars.deleteCalendarPopup(this.props.team, calendar);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.team !== this.props.team ||
      prevProps.calendars !== this.props.calendars
    ) {
      this.setState({ selectedCalendarId: this.getValidCalendarIdOrNull() });
    }
  }

  render() {
    let calendarSelectOptions = [];
    if (Cache.getCurrentTeamData()._state.calendars._initial) {
      calendarSelectOptions.push(
        <option key="0" value="0">
          Laden...
        </option>
      );
    } else if (Object.keys(this.props.calendars).length === 0) {
      calendarSelectOptions.push(
        <option key="0" value="0">
          Keine Kalender vorhanden
        </option>
      );
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
        <button
          key="create"
          className="btn btn-outline-success"
          onClick={this.createCalendar}
        >
          Neu erstellen
        </button>
      );
      if (calendar !== undefined) {
        calendarPanelButtons.push(
          <button
            key="edit"
            className="btn btn-outline-dark mx-2"
            onClick={this.editCalendar}
          >
            Bearbeiten
          </button>
        );
        calendarPanelButtons.push(
          <button
            key="delete"
            className="btn btn-outline-danger"
            onClick={this.deleteCalendar}
          >
            Löschen
          </button>
        );
      }
    }

    return [
      <select
        key="select"
        className="form-select mb-2"
        onInput={this.handleCalendarSelect}
        disabled={calendar === undefined}
      >
        {calendarSelectOptions}
      </select>,
      calendar !== undefined ? (
        <table key="table" className="table table-borderless mb-2">
          <tbody>
            <tr>
              <th>Name:</th>
              <td>{calendar.name}</td>
            </tr>
            <tr>
              <th>Beschreibung:</th>
              <td style={{ whiteSpace: "pre" }}>{calendar.description}</td>
            </tr>
            <tr>
              <th>
                Abonnieren:
              </th>
              <td>
                <a href={"webcal://" + calendar.ics_url.split("//")[1]} className="me-1">
                  Webcal
                </a>
                <HoverInfo title="Auf unterstützen Geräten sollte sich dieser Link direkt in der Kalenderapp öffnen. Falls nicht, kann in den meisten Apps ein Kalender via URL abonniert werden. Dazu einfach diesen Link kopieren und dort einfügen." />
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
      ) : null,
      calendarPanelButtons,
    ];
  }
}

export default class Page_WorkingTime extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (Cache.getCurrentTeamData()._state.calendars._initial) {
      Cache.refreshTeamCacheCategory(this.props.team.id, "calendars");
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
          <Dashboard.DashboardTile title="Kalenderinfos">
            {/* Selecting, creating and managing calendars */}
            <CalendarManager team={this.props.team} calendars={this.props.calendars} isAdmin={this.props.isAdmin} />
          </Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>
      </Dashboard.Dashboard>
    );
  }
}
