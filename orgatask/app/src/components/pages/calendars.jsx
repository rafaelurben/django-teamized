"use strict";

import * as Calendars from "../../utils/calendars.js";
import * as Cache from "../../utils/cache.js";
import * as Navigation from "../../utils/navigation.js";

import * as Dashboard from "../dashboard.js";
import {HoverInfo} from "../utils.js";

class CalendarManager extends React.Component {
  constructor(props) {
    super(props);
    this.handleCalendarSelect = this.handleCalendarSelect.bind(this);

    this.createCalendar = this.createCalendar.bind(this);
    this.editCalendar = this.editCalendar.bind(this);
    this.deleteCalendar = this.deleteCalendar.bind(this);
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
              <th>Abonnieren:</th>
              <td>
                <a
                  href={"webcal://" + calendar.ics_url.split("//")[1]}
                  className="me-1"
                >
                  Webcal
                </a>
                <HoverInfo title="Auf unterstützen Geräten sollte sich der Webcal-Link beim anklicken direkt in der Kalenderapp öffnen. Falls nicht, kann in den meisten Kalenderapps ein Kalender via URL abonniert werden. Dazu einfach der linke Link in das dafür vorgesehene Feld kopieren. Falls dieser nicht funktioniert, bitte den rechten verwenden. Die Datei sollte jedoch NICHT heruntergeladen werden. Sonst werden nur die aktuell vorhandenen Ereignisse gespeichert." />
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
                  className="fas fa-circle small dm-invert"
                ></i>
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

    let rows;
    if (events.length > 0) {
      rows = events.map((event) => {
        return <CalendarEventPickerRow
          key={event.id}
          event={event}
          selectedDate={this.props.selectedDate}
          onSelect={this.props.onEventSelect}
          isSelected={this.props.selectedEventId === event.id}
        />;
      });
    } else if (Object.keys(this.props.calendars).length > 0) {
      rows = [
        <p className="ms-1 mb-1" key="emptymessage">
          Keine Ereignisse an diesem Datum.
        </p>,
        <button
          key="create"
          className="btn btn-outline-success mt-2"
          onClick={this.createEvent}
        >
          Ereignis erstellen
        </button>,
      ];
    } else {
      rows = <p className="ms-1 mb-0" key="nocalmessage">Im ausgewählten Team ist noch kein Kalender vorhanden.</p>;
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
        <div className="mt-3">{weekElems}</div>
      </div>
    );
  }
}

class CalendarEventDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.editEvent = this.editEvent.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);
  }

  editEvent() {

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
        className="btn btn-outline-dark disabled"
        onClick={this.editEvent}
      >
        Bearbeiten
      </button>,
      <button
        key="delete"
        className="btn btn-outline-danger ms-2"
        onClick={this.deleteEvent}
      >
        Löschen
      </button>
    ]
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
      Cache.refreshTeamCacheCategory(this.props.team.id, "calendars");
    }

    let dayDisplay = Calendars.getDateString(this.state.selectedDate);

    return (
      <Dashboard.Dashboard
        title="Kalender"
        subtitle="(w.i.p.) Kalender für dich und dein Team."
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
          <Dashboard.DashboardTile title="Ausgewähltes Ereignis">
            {/* Selected event */}
            <CalendarEventDisplay
              event={this.events[this.state.selectedEventId]}
              team={this.props.team}
            />
          </Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>
        <Dashboard.DashboardColumn sizes={{ lg: 6 }}>
          <Dashboard.DashboardTile title={"Ereignisse am " + dayDisplay}>
            {/* Events from the selected day & Create new event button */}
            <CalendarEventPicker
              onEventSelect={this.handleEventSelect}
              selectedDate={this.state.selectedDate}
              selectedEventId={this.state.selectedEventId}
              events={Calendars.filterCalendarEventsByDate(
                Object.values(this.events),
                this.state.selectedDate
              )}
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
              selectedCalendar={Cache.getCurrentTeamData().calendars[this.state.selectedCalendarId]}
              isAdmin={this.props.isAdmin}
            />
          </Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>
      </Dashboard.Dashboard>
    );
  }
}
