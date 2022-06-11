"use strict";

import * as Calendars from "../../utils/calendars.js";
import * as Cache from "../../utils/cache.js";
import * as Navigation from "../../utils/navigation.js";

import * as Dashboard from "../dashboard.js";
import {HoverInfo} from "../utils.js";

class CalendarManager extends React.Component {
  constructor(props) {
    super(props);

    this.getCalendar = this.getCalendar.bind(this);
    this.ensureValidCalendarId = this.ensureValidCalendarId.bind(this);
    this.handleCalendarSelect = this.handleCalendarSelect.bind(this);

    this.createCalendar = this.createCalendar.bind(this);
    this.editCalendar = this.editCalendar.bind(this);
    this.deleteCalendar = this.deleteCalendar.bind(this);

    this.state = { selectedCalendarId: null };
  }

  getCalendar() {
    return Cache.getCurrentTeamData().calendars[this.state.selectedCalendarId];
  }

  ensureValidCalendarId() {
    const isValid = this.props.calendars.hasOwnProperty(this.state.selectedCalendarId);
    const calendarIds = Object.keys(this.props.calendars);
    const hasCalendar = calendarIds.length > 0;

    if (!isValid && hasCalendar) {
      // If the current calendar is invalid and there are calendars, select the first one.
      this.setState({selectedCalendarId: calendarIds[0]});
    } else if (!isValid && this.state.selectedCalendarId !== null) {
      // If the current calendar is set but there are no calendars, select null.
      this.setState({selectedCalendarId: null});
    }
  }
  
  handleCalendarSelect(event) {
    let calId = event.target.value;
    this.setState({ selectedCalendarId: calId });
  }

  createCalendar() {
    Calendars.createCalendarPopup(this.props.team).then(
      (calendar) => {
        this.setState({ selectedCalendarId: calendar.id });
      }
    );
  }

  editCalendar() {
    const calendar = this.getCalendar();
    Calendars.editCalendarPopup(this.props.team, calendar).then(
      Navigation.renderPage
    );
  }

  deleteCalendar() {
    const calendar = this.getCalendar();
    Calendars.deleteCalendarPopup(this.props.team, calendar).then(() => {
      this.setState({ selectedCalendarId: null });
    });
  }

  componentDidMount() {
    this.ensureValidCalendarId();
  }

  componentDidUpdate(prevProps, prevState) {
    this.ensureValidCalendarId();
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
        value={this.state.selectedCalendarId || "0"}
        abc={this.state.selectedCalendarId || "0"}
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
              <th>Abonnieren:</th>
              <td>
                <a
                  href={"webcal://" + calendar.ics_url.split("//")[1]}
                  className="me-1"
                >
                  Webcal
                </a>
                <HoverInfo title="Auf unterstützen Geräten sollte sich der Webcal-Link direkt in der Kalenderapp öffnen. Falls nicht, kann in den meisten Apps ein Kalender via URL abonniert werden. Dazu einfach einen der beiden Links kopieren und dort einfügen, NICHT die Datei herunterladen." />
                <a href={calendar.ics_url} className="ms-1">
                  HTTP(S)
                </a>
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

class CalendarOverviewDay extends React.Component {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);

    this.getDateClassName = this.getDateClassName.bind(this);
  }

  handleSelect() {
    this.props.onSelect(this.props.date);
  }

  getDateClassName() {
    let className = "d-flex justify-content-center align-items-center rounded-circle";
    if (this.props.isSelected && this.props.isToday) {
      className += " bg-danger fw-bold text-white";
    } else if (this.props.isSelected) {
      className += " bg-primary text-white";
    } else if (this.props.isToday) {
      className += " text-danger fw-bold";
    } else {
      className += " text-dark";
    }

    if (!this.props.isInSelectedMonth) {
      className += " opacity-50";
    }
    return className;
  }

  render() {
    return (
      <div onClick={this.handleSelect}>
        <div className={this.getDateClassName()} style={{ width: "3em", height: "3em", cursor: "pointer" }}>
          <span>
            {this.props.date.getDate()}
          </span>
        </div>
      </div>
    );
  }
}

class CalendarOverviewWeek extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let days = [];
    for (let i = 0; i < 7; i++) {
      days.push(Calendars.roundDays(this.props.firstDay, i));
    }

    let dayElems = days.map((date, i) => {
      return (
        <CalendarOverviewDay
          key={i}
          date={date}
          events={Calendars.filterCalendarEventsByDate(this.props.events, date)}
          isToday={Calendars.isSameDate(date, new Date())}
          isSelected={Calendars.isSameDate(this.props.selectedDate, date)}
          isInSelectedMonth={Calendars.isSameDate(this.props.selectedMonth, Calendars.roundMonths(date))}
          onSelect={this.props.onDateSelect}
        />
      )
    });

    return (
      <div className="d-flex justify-content-around my-3">
        {dayElems}
      </div>
    );
  }
}

class CalendarOverview extends React.Component {
  constructor(props) {
    super(props);
    this.go2prevMonth = this.go2prevMonth.bind(this);
    this.go2today = this.go2today.bind(this);
    this.go2nextMonth = this.go2nextMonth.bind(this);

    this.state = {
      selectedMonth: Calendars.roundMonths(new Date()),
    };
  }

  go2prevMonth() {
    this.setState({
      selectedMonth: Calendars.roundMonths(this.state.selectedMonth, -1),
    });
  }

  go2today() {
    const date = new Date();
    this.setState({
      selectedMonth: Calendars.roundMonths(date, 0),
    });
    this.props.onDateSelect(date);
  }

  go2nextMonth() {
    this.setState({
      selectedMonth: Calendars.roundMonths(this.state.selectedMonth, 1),
    });
  }

  render() {
    const isToday = Calendars.isSameDate(this.props.selectedDate, new Date);
    const firstDayShown = Calendars.getMondayOfWeek(this.state.selectedMonth);

    let monthDisplay = this.state.selectedMonth.toLocaleString(undefined, {
      month: "long",
      year: "numeric",
    });

    let weekElems = [];
    for (let i = 0; i < 6; i++) {
      weekElems.push(
        <CalendarOverviewWeek
          key={i}
          firstDay={Calendars.roundDays(firstDayShown, i * 7)}
          selectedMonth={this.state.selectedMonth}
          selectedDate={this.props.selectedDate}
          onDateSelect={this.props.onDateSelect}
          events={this.props.events}
        />
      );
    }

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0 ms-1">{monthDisplay}</h4>
          <div className="btn-group">
            <button
              type="button"
              className="btn btn-outline-dark"
              onClick={this.go2prevMonth}
            >
              <i className="fas fa-arrow-left" />
            </button>
            <button
              type="button"
              className={
                isToday ? "btn btn-dark disabled" : "btn btn-outline-dark"
              }
              onClick={this.go2today}
            >
              Heute
            </button>
            <button
              type="button"
              className="btn btn-outline-dark"
              onClick={this.go2nextMonth}
            >
              <i className="fas fa-arrow-right" />
            </button>
          </div>
        </div>
        <div className="mt-3">{weekElems}</div>
      </div>
    );
  }
}

export default class Page_Calendars extends React.Component {
  constructor(props) {
    super(props);
    this.handleDateSelect = this.handleDateSelect.bind(this);

    this.state = { selectedDate: Calendars.roundDays(new Date()) };
  }

  handleDateSelect(date) {
    this.setState({ selectedDate: Calendars.roundDays(date) });
  }

  render() {
    if (Cache.getCurrentTeamData()._state.calendars._initial) {
      Cache.refreshTeamCacheCategory(this.props.team.id, "calendars");
    }

    let events = Calendars.flattenCalendarEvents(this.props.calendars);

    let dayDisplay = this.state.selectedDate.toLocaleString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <Dashboard.Dashboard
        title="Kalender"
        subtitle="(w.i.p.) Kalender für dich und dein Team."
      >
        <Dashboard.DashboardColumn sizes={{ lg: 6 }}>
          <Dashboard.DashboardTile title="Übersicht">
            {/* Calendar overview */}
            <CalendarOverview
              onDateSelect={this.handleDateSelect}
              selectedDate={this.state.selectedDate}
              events={events}
            />
          </Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>
        <Dashboard.DashboardColumn sizes={{ lg: 6 }}>
          <Dashboard.DashboardTile title={"Ereignisse am "+dayDisplay}>
            {/* Events from the selected day & Create new event button */}
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
