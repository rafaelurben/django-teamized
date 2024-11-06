'use strict';

/**
 * Calendar page component (main component at the end of this file)
 */

import React from 'react';

import * as Calendars from '../../utils/calendars.ts';
import * as Cache from '../../utils/cache.ts';
import * as Navigation from '../../utils/navigation.tsx';

import * as Dashboard from '../common/dashboard.tsx';
import { IconTooltip, Tooltip } from '../tooltips.jsx';

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

class CalendarSelectorRow extends React.Component {
    constructor(props) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect() {
        if (!this.props.isSelected) {
            this.props.onSelect(this.props.calendar.id);
        }
    }

    getStyle() {
        return {
            paddingLeft: this.props.isSelected ? '.5rem' : 'calc(.5rem + 3px)',
            borderLeftWidth: this.props.isSelected ? '8px' : '5px',
            borderLeftColor: this.props.calendar.color,
            borderLeftStyle: 'solid',
            cursor: 'pointer',
            opacity: this.props.isSelected ? 1 : 0.75,
            fontWeight: this.props.isSelected ? 'bold' : 'normal',
        };
    }

    render() {
        return (
            <div
                className="py-1 mb-1"
                style={this.getStyle()}
                onClick={this.handleSelect}
            >
                <span className="d-inline-block w-100">
                    {this.props.calendar.name}
                </span>
            </div>
        );
    }
}

class CalendarSelector extends React.Component {
    constructor(props) {
        super(props);

        this.createCalendar = this.createCalendar.bind(this);
    }

    createCalendar() {
        Calendars.createCalendarPopup(this.props.team).then((calendar) => {
            this.props.onCalendarSelect(calendar.id);
        });
    }

    render() {
        let listview = Object.values(this.props.calendars).map((calendar) => {
            return (
                <CalendarSelectorRow
                    key={calendar.id}
                    calendar={calendar}
                    onSelect={this.props.onCalendarSelect}
                    isSelected={this.props.selectedCalendarId === calendar.id}
                />
            );
        });

        let content = [];
        if (listview.length > 0) {
            content.push(
                <div key="calendarselect" className="mb-2">
                    {listview}
                </div>
            );
        }

        if (this.props.isAdmin) {
            content.push(
                <button
                    key="create"
                    className="btn btn-outline-success"
                    onClick={this.createCalendar}
                >
                    Kalender erstellen
                </button>
            );
        } else {
            content.push(
                <Tooltip
                    key="noadmin"
                    title="Diese Aktion steht nur Admins zur Verfügung"
                >
                    <button className="btn btn-outline-dark disabled">
                        Kalender erstellen
                    </button>
                </Tooltip>
            );
        }

        return content;
    }
}

class CalendarInfo extends React.Component {
    constructor(props) {
        super(props);

        this.editCalendar = this.editCalendar.bind(this);
        this.deleteCalendar = this.deleteCalendar.bind(this);

        this.subscriptionPopup = this.subscriptionPopup.bind(this);
    }

    editCalendar() {
        Calendars.editCalendarPopup(
            this.props.team,
            this.props.selectedCalendar
        ).then(Navigation.renderPage);
    }

    deleteCalendar() {
        Calendars.deleteCalendarPopup(
            this.props.team,
            this.props.selectedCalendar
        ).then(() => {
            this.props.onCalendarSelect(null);
        });
    }

    async subscriptionPopup() {
        await Calendars.showCalendarSubscriptionPopup(
            this.props.selectedCalendar
        );
    }

    render() {
        let calendar = this.props.selectedCalendar;
        if (calendar === undefined) {
            return (
                <p className="ms-1 mb-0">
                    Im ausgewählten Team ist noch kein Kalender vorhanden.{' '}
                    {this.props.isAdmin ? (
                        <IconTooltip
                            key="admin"
                            title='Du kannst mit den "Kalender erstellen"-Knopf weiter oben eine neue Liste erstellen.'
                        ></IconTooltip>
                    ) : (
                        <IconTooltip
                            key="noadmin"
                            title="Bitte wende dich an einen Admin dieses Teams, um einen neuen Kalender zu erstellen."
                        ></IconTooltip>
                    )}
                </p>
            );
        }

        let calendarPanelButtons = [];
        if (this.props.isAdmin) {
            if (calendar !== undefined) {
                calendarPanelButtons.push(
                    <button
                        key="edit"
                        className="btn btn-outline-dark"
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
                <Tooltip
                    key="noadmin"
                    title="Diese Aktionen stehen nur Admins zur Verfügung"
                >
                    <button className="btn btn-outline-dark disabled">
                        Bearbeiten/Löschen
                    </button>
                </Tooltip>
            );
        }
        calendarPanelButtons.push(
            <button
                key="subscribe"
                className="btn btn-outline-info"
                onClick={this.subscriptionPopup}
            >
                Abonnieren
            </button>
        );

        return (
            <Dashboard.Table>
                <tbody>
                    <tr>
                        <th>Name:</th>
                        <td>{calendar.name}</td>
                    </tr>
                    <tr>
                        <th style={{ width: '1px' }} className="pe-3">
                            Beschreibung:
                        </th>
                        <td style={{ whiteSpace: 'pre-line' }}>
                            {calendar.description}
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
                    <tr className="debug-only">
                        <th>ID:</th>
                        <td>{calendar.id}</td>
                    </tr>
                </tbody>
                <Dashboard.TableButtonFooter noTopBorder={true}>
                    {calendarPanelButtons}
                </Dashboard.TableButtonFooter>
            </Dashboard.Table>
        );
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
            borderLeftWidth: '5px',
            borderLeftStyle: this.props.event.fullday ? 'solid' : 'dotted',
            borderLeftColor: this.props.event.calendar.color,
            cursor: 'pointer',
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
                return 'Ganztägig';
            } else {
                return (
                    'Vom ' +
                    Calendars.getDateString(evtstart) +
                    ' bis am ' +
                    Calendars.getDateString(evtend)
                );
            }
        } else {
            const evtstart = new Date(this.props.event.dtstart);
            const evtend = new Date(this.props.event.dtend);
            const samedaystart = evtstart.getTime() >= daystart.getTime();
            const samedayend = evtend.getTime() < dayend.getTime();

            if (samedaystart && samedayend) {
                return (
                    'Von ' +
                    Calendars.getTimeString(evtstart) +
                    ' bis ' +
                    Calendars.getTimeString(evtend) +
                    ' Uhr'
                );
            } else if (samedaystart) {
                return 'Ab ' + Calendars.getTimeString(evtstart) + ' Uhr';
            } else if (samedayend) {
                return 'Bis ' + Calendars.getTimeString(evtend) + ' Uhr';
            } else {
                return 'Ganztägig';
            }
        }
    }

    render() {
        return (
            <div
                className="ps-2 mb-1"
                style={this.getStyle()}
                onClick={this.handleSelect}
            >
                <b className="d-inline-block w-100">{this.props.event.name}</b>
                <span className="d-inline-block w-100">
                    {this.getDateDisplay()}
                </span>
                {this.props.event.location !== '' ? (
                    <i className="d-inline-block w-100">
                        {this.props.event.location}
                    </i>
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
        Calendars.createEventPopup(
            this.props.team,
            this.props.selectedDate,
            this.props.calendars,
            this.props.selectedCalendar.id
        ).then(Navigation.renderPage);
    }

    render() {
        let events = [...this.props.events];
        events.sort((a, b) => {
            if (a.fullday && b.fullday) {
                return (
                    new Date(a.dstart).getTime() - new Date(b.dstart).getTime()
                );
            } else if (!a.fullday && !b.fullday) {
                return (
                    new Date(a.dtstart).getTime() -
                    new Date(b.dtstart).getTime()
                );
            } else if (a.fullday) {
                return -1;
            } else {
                return 1;
            }
        });

        const calendarExists =
            this.props.selectedCalendar !== undefined &&
            this.props.selectedCalendar !== null;
        const eventExists = this.props.events.length > 0;

        let rows;
        if (calendarExists) {
            if (eventExists) {
                rows = events.map((event) => {
                    return (
                        <CalendarEventPickerRow
                            key={event.id}
                            event={event}
                            selectedDate={this.props.selectedDate}
                            onSelect={this.props.onEventSelect}
                            isSelected={this.props.selectedEventId === event.id}
                        />
                    );
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
                    Im ausgewählten Team ist noch kein Kalender vorhanden.{' '}
                    {this.props.isAdmin ? (
                        <IconTooltip title='Du kannst mit den "Neu erstellen"-Knopf weiter unten einen neuen Kalender erstellen.'></IconTooltip>
                    ) : (
                        <IconTooltip title="Bitte wende dich an einen Admin dieses Teams, um einen neuen Kalender zu erstellen."></IconTooltip>
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
        let className =
            'd-flex justify-content-center align-items-center flex-column rounded-circle dm-noinvert';
        if (this.props.isSelected && this.props.isToday) {
            className += ' bg-danger fw-bold ';
        } else if (this.props.isSelected) {
            className += ' bg-primary ';
        } else if (this.props.isToday) {
            className += ' text-danger fw-bold';
        } else {
            className += ' ';
        }

        if (!this.props.isInSelectedMonth) {
            className += ' opacity-50';
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
                <div
                    className={this.getDateClassName()}
                    style={{ width: '3em', height: '3em', cursor: 'pointer' }}
                >
                    <span>{this.props.date.getDate()}</span>
                    {this.props.isSelected ? null : (
                        <span style={{ fontSize: '0.4rem', height: '0.4rem' }}>
                            {colors.map((color) => {
                                return (
                                    <span key={color} style={{ color: color }}>
                                        <i className="fas fa-circle"></i>
                                    </span>
                                );
                            })}
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
                    events={Calendars.filterCalendarEventsByDate(
                        this.props.events,
                        date
                    )}
                    isToday={Calendars.isSameDate(date, new Date())}
                    isSelected={Calendars.isSameDate(
                        this.props.selectedDate,
                        date
                    )}
                    isInSelectedMonth={Calendars.isSameDate(
                        this.props.selectedMonth,
                        Calendars.roundMonths(date)
                    )}
                    onSelect={this.props.onDateSelect}
                />
            );
        });

        return (
            <div className="d-flex justify-content-around my-3">{dayElems}</div>
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
        const todaySelectedInCurrentMonth =
            Calendars.isSameDate(this.props.selectedDate, today) &&
            Calendars.isSameDate(
                this.state.selectedMonth,
                Calendars.roundMonths(today)
            );
        const firstDayShown = Calendars.getMondayOfWeek(
            this.state.selectedMonth
        );

        let monthDisplay = this.state.selectedMonth.toLocaleString(undefined, {
            month: 'long',
            year: 'numeric',
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
                                    ? 'btn btn-outline-dark disabled'
                                    : 'btn btn-outline-dark'
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
                        {WEEKDAYS.map((day) => {
                            return (
                                <div key={day}>
                                    <div
                                        className="d-flex justify-content-center align-items-center flex-column"
                                        style={{ width: '3em', height: '2em' }}
                                    >
                                        <b>{day}</b>
                                    </div>
                                </div>
                            );
                        })}
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
        Calendars.editEventPopup(
            this.props.team,
            this.props.event.calendar,
            this.props.event
        ).then(Navigation.renderPage);
    }

    cloneEvent() {
        Calendars.editEventPopup(
            this.props.team,
            this.props.event.calendar,
            this.props.event,
            true
        ).then(Navigation.renderPage);
    }

    deleteEvent() {
        Calendars.deleteEventPopup(
            this.props.team,
            this.props.event.calendar,
            this.props.event
        ).then(Navigation.renderPage);
    }

    render() {
        if (this.props.event === undefined) {
            return <p className="ms-1 mb-1">Kein Ereignis ausgewählt</p>;
        }

        const event = this.props.event;

        let evtstartdsp;
        let evtenddsp;

        if (this.props.event.fullday) {
            evtstartdsp = Calendars.getDateString(
                new Date(this.props.event.dstart)
            );
            evtenddsp = Calendars.getDateString(
                new Date(this.props.event.dend)
            );
        } else {
            evtstartdsp = Calendars.getDateTimeString(
                new Date(this.props.event.dtstart)
            );
            evtenddsp = Calendars.getDateTimeString(
                new Date(this.props.event.dtend)
            );
        }

        return (
            <Dashboard.Table vertical={true}>
                <tbody>
                    <tr>
                        <th>Name:</th>
                        <td>{event.name}</td>
                    </tr>
                    {event.description ? (
                        <tr>
                            <th style={{ width: '1px' }} className="pe-3">
                                Beschreibung:
                            </th>
                            <td style={{ whiteSpace: 'pre-line' }}>
                                {event.description}
                            </td>
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

                <Dashboard.TableButtonFooter noTopBorder={true}>
                    <button
                        className="btn btn-outline-dark"
                        onClick={this.editEvent}
                    >
                        Bearbeiten
                    </button>
                    <button
                        className="btn btn-outline-dark"
                        onClick={this.cloneEvent}
                    >
                        Duplizieren
                    </button>
                    <button
                        className="btn btn-outline-danger"
                        onClick={this.deleteEvent}
                    >
                        Löschen
                    </button>
                </Dashboard.TableButtonFooter>
            </Dashboard.Table>
        );
    }
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
        // If the current selected event is no at in the new selected date, deselect it
        let evt = this.events[this.state.selectedEventId];
        if (evt && !Calendars.isDateInEvent(date, evt)) {
            this.setState({ selectedEventId: null });
        }
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

        let selectedCalendar =
            Cache.getCurrentTeamData().calendars[this.state.selectedCalendarId];

        return (
            <Dashboard.Page
                title="Kalender"
                subtitle="Kalender für dich und dein Team"
                loading={Cache.getCurrentTeamData()._state.calendars._initial}
            >
                <Dashboard.Column sizes={{ lg: 6 }} className="order-lg-2">
                    <Dashboard.Tile
                        title="Ereignisübersicht"
                        help="Hier werden Ereignisse aus allen Kalendern des aktuellen Teams angezeigt"
                    >
                        {/* Calendar overview */}
                        <CalendarOverview
                            onDateSelect={this.handleDateSelect}
                            selectedDate={this.state.selectedDate}
                            events={Object.values(this.events)}
                        />
                    </Dashboard.Tile>
                    <Dashboard.Tile
                        title={'Ereignisse am ' + dayDisplay}
                        help="Klicke auf einen Tag in der Ereignisübersicht, um zu diesem zu wechseln."
                    >
                        {/* Events from the selected day & Create new event button */}
                        <CalendarEventPicker
                            onEventSelect={this.handleEventSelect}
                            selectedDate={this.state.selectedDate}
                            selectedEventId={this.state.selectedEventId}
                            selectedCalendar={selectedCalendar}
                            calendars={this.props.calendars}
                            events={Calendars.filterCalendarEventsByDate(
                                Object.values(this.events),
                                this.state.selectedDate
                            )}
                            team={this.props.team}
                            isAdmin={this.props.isAdmin}
                        />
                    </Dashboard.Tile>
                </Dashboard.Column>
                <Dashboard.Column sizes={{ lg: 6 }}>
                    <Dashboard.Tile
                        title="Ausgewähltes Ereignis"
                        help="Klicke auf ein Ereignis in der Ereignisliste, um es auszuwählen/abzuwählen."
                        className="order-lg-3"
                    >
                        {/* Selected event */}
                        <CalendarEventDisplay
                            event={this.events[this.state.selectedEventId]}
                            team={this.props.team}
                        />
                    </Dashboard.Tile>
                    <Dashboard.Tile
                        title="Kalenderübersicht"
                        help="Wechsle zwischen den Kalendern deines Teams oder erstelle einen neuen. Diese Auswahl hat keinen Einfluss auf die angezeigten Ereignisse."
                    >
                        {/* Calendar selector/creator */}
                        <CalendarSelector
                            onCalendarSelect={this.handleCalendarSelect}
                            team={this.props.team}
                            calendars={this.props.calendars}
                            selectedCalendarId={this.state.selectedCalendarId}
                            selectedCalendar={selectedCalendar}
                            isAdmin={this.props.isAdmin}
                        />
                    </Dashboard.Tile>
                    <Dashboard.Tile
                        title="Kalenderdetails"
                        help="Sieh dir Infos zum oben ausgewählten Kalender an."
                    >
                        {/* Selecting, creating and managing calendars */}
                        <CalendarInfo
                            onCalendarSelect={this.handleCalendarSelect}
                            team={this.props.team}
                            calendars={this.props.calendars}
                            selectedCalendarId={this.state.selectedCalendarId}
                            selectedCalendar={selectedCalendar}
                            isAdmin={this.props.isAdmin}
                        />
                    </Dashboard.Tile>
                </Dashboard.Column>
            </Dashboard.Page>
        );
    }
}
