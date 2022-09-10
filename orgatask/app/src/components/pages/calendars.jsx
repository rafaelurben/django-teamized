"use strict";

import * as Calendars from "../../utils/calendars.js";
import * as Cache from "../../utils/cache.js";
import * as Navigation from "../../utils/navigation.js";

import * as Dashboard from "../dashboard.js";
import { TooltipIcon, Tooltip } from "../tooltips.js";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

class CalendarManager extends React.Component {
  constructor(props) {
    super(props);
    this.handleCalendarSelect = this.handleCalendarSelect.bind(this);

    this.createCalendar = this.createCalendar.bind(this);
    this.editCalendar = this.editCalendar.bind(this);
    this.deleteCalendar = this.deleteCalendar.bind(this);
  
    this.subscriptionPopup = this.subscriptionPopup.bind(this);
  }
  
  handleCalendarSelect(event) {
    this.props.onCalendarSelect(event.target.value);
  }

  createCalendar() {
    Calendars.createCalendarPopup(this.props.team).then(
      (calendar) => {
        this.props.onCalendarSelect(calendar.id);
      }
    );
  }

  editCalendar() {
    Calendars.editCalendarPopup(this.props.team, this.props.selectedCalendar).then(
      Navigation.renderPage
    );
  }

  deleteCalendar() {
    Calendars.deleteCalendarPopup(this.props.team, this.props.selectedCalendar).then(() => {
      this.props.onCalendarSelect(null);
    });
  }

  subscriptionPopup() {
    const httpurl = this.props.selectedCalendar.ics_url;
    const webcalurl = "webcal://" + httpurl.split("//")[1];

    Swal.fire({
      title: "Kalender abonnieren",
      html:
        "Um den Kalender zu abonnieren, hast du zwei Möglichkeiten:" +
        "<hr><h5>1) Webcal-Link</h5>" +
        "Auf allen Apple-Geräten sowie weiteren unterstützten Geräten kannst du Webcal-Links direkt in deiner Kalender-App öffnen. " +
        "Bei manchen anderen Apps (z. B. Google Calendar) musst du den Link kopieren und manuell einfügen.<br>" +
        `<br><a href="${webcalurl}" target="_blank" class="btn btn-outline-info">Webcal-URL</a><br>` +
        "<hr><h5>2) HTTP-Link</h5>" +
        "Falls dein Gerät oder deine App Webcal-Links nicht unterstützt, kannst du den Kalender auch über HTTP(S) abonnieren. " +
        "Hierbei musst du aber aufpassen, dass du den Link nicht öffnest, sondern ihn kopierst und in deiner Kalender-App einfügst. " +
        "Sonst wird nur der aktuelle Stand des Kalenders heruntergeladen, aber keine Änderungen mehr übertragen.<br>" +
        `<br><a href="${httpurl}" target="_blank" class="btn btn-outline-info">HTTP(S)-URL</a><br>`,
      showCancelButton: true,
      showConfirmButton: false,
      cancelButtonText: "Schliessen",
    });
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

    let calendar = this.props.selectedCalendar;

    let calendarPanelButtons = [];
    if (this.props.isAdmin) {
      calendarPanelButtons.push(
        <button
          key="create"
          className="btn btn-outline-success"
          onClick={this.createCalendar}
        >
          Kalender erstellen
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
    } else {
      calendarPanelButtons.push(
        <Tooltip key="noadmin" title="Diese Aktionen stehen nur Admins zur Verfügung">
          <button className="btn btn-outline-dark disabled">
            Erstellen/Bearbeiten/Löschen
          </button>
        </Tooltip>
      );
    }

    return [
      <select
        key="select"
        id="calendar-manager-calendar-select"
        className="form-select mb-2"
        onInput={this.handleCalendarSelect}
        disabled={calendar === undefined}
        value={this.props.selectedCalendarId || "0"}
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
              <th>Farbe:</th>
              <td>
                <i
                  style={{ color: calendar.color }}
                  className="fas fa-circle small dm-invert"
                ></i>
              </td>
            </tr>
            <tr>
              <th>Abonnieren:</th>
              <td>
                <button className="btn btn-outline-info" onClick={this.subscriptionPopup}>
                  Abonnieren
                </button>
              </td>
            </tr>
            <tr className="debug-only">
              <th>ID:</th>
              <td>{calendar.id}</td>
            </tr>
          </tbody>
        </table>
      ) : null,
      calendarPanelButtons,
    ];
  }
}

class CalendarEventPickerRow extends React.Component {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect() {
    if (this.props.isSelected) {
      this.props.onSelect(null);
    } else {
      this.props.onSelect(this.props.event);
    }
  }

  getStyle() {
    return {
      borderLeftWidth: "5px",
      borderLeftStyle: this.props.event.fullday ? "solid" : "dotted",
      borderLeftColor: this.props.event.calendar.color,
      cursor: "pointer",
      opacity: this.props.isSelected ? 0.75 : 1,
    };
  }

  getDateDisplay() {
    const daystart = Calendars.roundDays(this.props.selectedDate);
    const dayend = Calendars.roundDays(this.props.selectedDate, 1);

    if (this.props.event.fullday) {
      const evtstart = new Date(this.props.event.dstart);
      const evtend = new Date(this.props.event.dend);
      const samedaystart = Calendars.isSameDate(daystart, evtstart);
      const samedayend = Calendars.isSameDate(daystart, evtend);

      if (samedaystart && samedayend) {
        return "Ganztägig";
      } else {
        return "Vom " + Calendars.getDateString(evtstart) + " bis am " + Calendars.getDateString(evtend);
      }
    } else {
      const evtstart = new Date(this.props.event.dtstart);
      const evtend = new Date(this.props.event.dtend);
      const samedaystart = evtstart.getTime() >= daystart.getTime();
      const samedayend = evtend.getTime() < dayend.getTime();

      if (samedaystart && samedayend) {
        return "Von " + Calendars.getTimeString(evtstart) + " bis " + Calendars.getTimeString(evtend) + " Uhr";
      } else if (samedaystart) {
        return "Ab " + Calendars.getTimeString(evtstart) + " Uhr";
      } else if (samedayend) {
        return "Bis " + Calendars.getTimeString(evtend) + " Uhr";
      } else {
        return "Ganztägig";
      }
    }
  }

  render() {
    return (
      <div className="ps-2 mb-1 dm-invert dm-invert-children" style={this.getStyle()} onClick={this.handleSelect}>
        <b className="d-inline-block w-100">{this.props.event.name}</b>
        <span className="d-inline-block w-100">{this.getDateDisplay()}</span>
        {this.props.event.location !== "" ? (
          <i className="d-inline-block w-100">{this.props.event.location}</i>
        ) : null}
      </div>
    );
  }
}

class CalendarEventPicker extends React.Component {
  constructor(props) {
    super(props);
    this.createEvent = this.createEvent.bind(this);
  }

  createEvent() {
    Calendars.createEventPopup(this.props.team, this.props.selectedDate).then(Navigation.renderPage)
  }

  render() {
    let events = [...this.props.events];
    events.sort((a, b) => {
      if (a.fullday && b.fullday) {
        return new Date(a.dstart).getTime() - new Date(b.dstart).getTime();
      } else if (!a.fullday && !b.fullday) {
        return new Date(a.dtstart).getTime() - new Date(b.dtstart).getTime();
      } else if (a.fullday) {
        return -1;
      } else {
        return 1;
      }
    });

    const calendarExists = this.props.selectedCalendar !== undefined && this.props.selectedCalendar !== null;
    const eventExists = this.props.events.length > 0;

    let rows;
    if (calendarExists) {
      if (eventExists) {
        rows = events.map((event) => {
          return <CalendarEventPickerRow
            key={event.id}
            event={event}
            selectedDate={this.props.selectedDate}
            onSelect={this.props.onEventSelect}
            isSelected={this.props.selectedEventId === event.id}
          />;
        });
      } else {
        rows = [
          <p className="ms-1 mb-1" key="emptymessage">
            Keine Ereignisse an diesem Datum.
          </p>,
        ];
      }
      rows.push(
        <button
          key="create"
          className="btn btn-outline-success mt-2"
          onClick={this.createEvent}
        >
          Ereignis erstellen
        </button>
      );
    } else {
      rows = (
        <p className="ms-1 mb-0" key="empty">
          Im ausgewählten Team ist noch kein Kalender vorhanden.{" "}
          {this.props.isAdmin ? (
            <TooltipIcon title='Du kannst mit den "Neu erstellen"-Knopf weiter unten einen neuen Kalender erstellen.'></TooltipIcon>
          ) : (
            <TooltipIcon title="Bitte wende dich an einen Admin dieses Teams, um einen neuen Kalender zu erstellen."></TooltipIcon>
          )}
        </p>
      );
    }
    return rows;
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
    let className = "d-flex justify-content-center align-items-center flex-column rounded-circle dm-noinvert";
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
    let colors = [];
    for (let event of this.props.events) {
      if (!colors.includes(event.calendar.color)) {
        colors.push(event.calendar.color);
      }
    }

    return (
      <div onClick={this.handleSelect}>
        <div className={this.getDateClassName()} style={{ width: "3em", height: "3em", cursor: "pointer" }}>
          <span>
            {this.props.date.getDate()}
          </span>
          { this.props.isSelected ? null : (
            <span style={{fontSize: "0.4rem", height: "0.4rem"}}>
              {
                colors.map((color) => {
                  return <span key={color} style={{ color: color }}><i className="fas fa-circle dm-invert"></i></span>;
                })
              }
            </span>
          )}
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
    const today = new Date();
    const todaySelectedInCurrentMonth = (
      Calendars.isSameDate(this.props.selectedDate, today) &&
      Calendars.isSameDate(this.state.selectedMonth, Calendars.roundMonths(today))
    );
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
                todaySelectedInCurrentMonth
                  ? "btn btn-outline-dark disabled"
                  : "btn btn-outline-dark"
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
        <div className="mt-3">
          <div className="d-flex justify-content-around my-3">
            {
              WEEKDAYS.map((day) => {
                return (
                  <div key={day}>
                    <div
                      className="d-flex justify-content-center align-items-center flex-column text-dark"
                      style={{width: "3em", height: "2em"}}
                    >
                      <b>{day}</b>
                    </div>
                  </div>
                );
              })
            }
          </div>
          {weekElems}
        </div>
      </div>
    );
  }
}

class CalendarEventDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.editEvent = this.editEvent.bind(this);
    this.cloneEvent = this.cloneEvent.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);
  }

  editEvent() {
    Calendars.editEventPopup(this.props.team, this.props.event.calendar, this.props.event).then(Navigation.renderPage);
  }

  cloneEvent() {
    Calendars.editEventPopup(this.props.team, this.props.event.calendar, this.props.event, true).then(Navigation.renderPage);
  }

  deleteEvent() {
    Calendars.deleteEventPopup(this.props.team, this.props.event.calendar, this.props.event).then(Navigation.renderPage)
  }

  render() {
    if (this.props.event === undefined) {
      return <p className="ms-1 mb-1">Kein Ereignis ausgewählt</p>
    }

    const event = this.props.event;

    let evtstartdsp;
    let evtenddsp;

    if (this.props.event.fullday) {
      evtstartdsp = Calendars.getDateString(new Date(this.props.event.dstart));
      evtenddsp = Calendars.getDateString(new Date(this.props.event.dend));
    } else {
      evtstartdsp = Calendars.getDateTimeString(new Date(this.props.event.dtstart));
      evtenddsp = Calendars.getDateTimeString(new Date(this.props.event.dtend));
    }

    return [
      <table key="table" className="table table-borderless mb-2">
        <tbody>
          <tr>
            <th>Name:</th>
            <td>{event.name}</td>
          </tr>
          {event.description ? (
            <tr>
              <th>Beschreibung:</th>
              <td style={{ whiteSpace: "pre" }}>{event.description}</td>
            </tr>
          ) : null}
          {event.location ? (
            <tr>
              <th>Ort:</th>
              <td>{event.location}</td>
            </tr>
          ) : null}
          <tr>
            <th>Start:</th>
            <td>{evtstartdsp}</td>
          </tr>
          <tr>
            <th>Ende:</th>
            <td>{evtenddsp}</td>
          </tr>
          <tr className="debug-only">
            <th>ID:</th>
            <td>{event.id}</td>
          </tr>
        </tbody>
      </table>,
      <button
        key="edit"
        className="btn btn-outline-dark"
        onClick={this.editEvent}
      >
        Bearbeiten
      </button>,
      <button
        key="clone"
        className="btn btn-outline-dark ms-2"
        onClick={this.cloneEvent}
      >
        Duplizieren
      </button>,
      <button
        key="delete"
        className="btn btn-outline-danger ms-2"
        onClick={this.deleteEvent}
      >
        Löschen
      </button>,
    ];
  };
}

export default class Page_Calendars extends React.Component {
  constructor(props) {
    super(props);
    this.handleCalendarSelect = this.handleCalendarSelect.bind(this);
    this.handleDateSelect = this.handleDateSelect.bind(this);
    this.handleEventSelect = this.handleEventSelect.bind(this);

    this.state = {
      selectedDate: Calendars.roundDays(new Date()),
      selectedCalendarId: null,
      selectedEventId: null,
    };
  }

  handleCalendarSelect(calendarId) {
    this.setState({ selectedCalendarId: calendarId });
  }

  handleDateSelect(date) {
    this.setState({ selectedDate: Calendars.roundDays(date) });
  }

  handleEventSelect(data) {
    this.setState({ selectedEventId: data ? data.id : null });
  }

  ensureValidCalendarId() {
    const isValid = this.props.calendars.hasOwnProperty(
      this.state.selectedCalendarId
    );
    const calendarIds = Object.keys(this.props.calendars);
    const hasCalendar = calendarIds.length > 0;

    if (!isValid && hasCalendar) {
      // If the current calendar is invalid and there are calendars, select the first one.
      this.setState({ selectedCalendarId: calendarIds[0] });
    } else if (!isValid && this.state.selectedCalendarId !== null) {
      // If the current calendar is set but there are no calendars, select null.
      this.setState({ selectedCalendarId: null });
    }
  }

  ensureValidEventId() {
    this.storeEvents();

    if (this.state.selectedEventId === null) {
      return;
    }

    const isValid = this.events.hasOwnProperty(this.state.selectedEventId);

    if (!isValid) {
      this.setState({ selectedEventId: null });
    }
  }

  storeEvents() {
    this.events = Calendars.flattenCalendarEvents(this.props.calendars);
  }

  componentDidMount() {
    this.ensureValidCalendarId();
    this.ensureValidEventId();
  }

  componentDidUpdate(prevProps, prevState) {
    this.ensureValidCalendarId();
    this.ensureValidEventId();
  }

  render() {
    this.storeEvents();

    if (Cache.getCurrentTeamData()._state.calendars._initial) {
      Calendars.getCalendars(this.props.team.id);
    }

    let dayDisplay = Calendars.getDateString(this.state.selectedDate);

    let selectedCalendar = Cache.getCurrentTeamData().calendars[this.state.selectedCalendarId];

    return (
      <Dashboard.Dashboard
        title="Kalender"
        subtitle="Kalender für dich und dein Team"
      >
        <Dashboard.DashboardColumn sizes={{ lg: 6 }}>
          <Dashboard.DashboardTile
            title="Ereignisübersicht"
            help="Hier werden Ereignisse aus allen Kalendern des aktuellen Teams angezeigt"
          >
            {/* Calendar overview */}
            <CalendarOverview
              onDateSelect={this.handleDateSelect}
              selectedDate={this.state.selectedDate}
              events={Object.values(this.events)}
            />
          </Dashboard.DashboardTile>
          <Dashboard.DashboardTile title="Ausgewähltes Ereignis" help="Klicke auf ein Ereignis in der Ereignisliste, um es auszuwählen/abzuwählen.">
            {/* Selected event */}
            <CalendarEventDisplay
              event={this.events[this.state.selectedEventId]}
              team={this.props.team}
            />
          </Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>
        <Dashboard.DashboardColumn sizes={{ lg: 6 }}>
          <Dashboard.DashboardTile title={"Ereignisse am " + dayDisplay} help="Klicke auf einen Tag in der Ereignisübersicht, um zu diesem zu wechseln.">
            {/* Events from the selected day & Create new event button */}
            <CalendarEventPicker
              onEventSelect={this.handleEventSelect}
              selectedDate={this.state.selectedDate}
              selectedEventId={this.state.selectedEventId}
              selectedCalendar={selectedCalendar}
              events={Calendars.filterCalendarEventsByDate(
                Object.values(this.events),
                this.state.selectedDate
              )}
              team={this.props.team}
              isAdmin={this.props.isAdmin}
            />
          </Dashboard.DashboardTile>
          <Dashboard.DashboardTile
            title="Kalenderinfos"
            help="Hier können die Kalender des aktuellen Teams angesehen und verwaltet (nur Admins) werden. Die Auswahl hat keinen Einfluss auf die angezeigten Ereignisse."
          >
            {/* Selecting, creating and managing calendars */}
            <CalendarManager
              onCalendarSelect={this.handleCalendarSelect}
              team={this.props.team}
              calendars={this.props.calendars}
              selectedCalendarId={this.state.selectedCalendarId}
              selectedCalendar={selectedCalendar}
              isAdmin={this.props.isAdmin}
            />
          </Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>
      </Dashboard.Dashboard>
    );
  }
}
