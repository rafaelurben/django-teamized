"use strict";

import { ms2HoursMinutesSeconds, seconds2HoursMinutesSeconds } from "../../utils/utils.js";
import { errorAlert } from "../../utils/alerts.js";
import * as Navigation from "../../utils/navigation.js";
import * as WorkingTime from "../../utils/workingtime.js";
import * as Cache from "../../utils/cache.js";
import { localInputFormat } from "../../utils/calendars.js";
import * as Dashboard from "../dashboard.js";
import { TooltipIcon } from "../tooltips.js";
import * as Stats from "../../utils/workingtimestats.js";

class WorkSessionTableRow extends React.Component {
  constructor(props) {
    super(props);
    this.getDurationDisplay = this.getDurationDisplay.bind(this);
    this.handleDeleteButtonClick = this.handleDeleteButtonClick.bind(this);
    this.handleEditButtonClick = this.handleEditButtonClick.bind(this);
  }

  async handleDeleteButtonClick() {
    await WorkingTime.deleteWorkSessionPopup(this.props.team, this.props.session);
    Navigation.renderPage();
  }

  async handleEditButtonClick() {
    await WorkingTime.editWorkSessionPopup(this.props.team, this.props.session);
    Navigation.renderPage();
  }

  getDurationDisplay() {
    let data = seconds2HoursMinutesSeconds(this.props.session.duration);
    return `${data.hours}h ${data.minutes}min ${data.seconds}s`;
  }

  render() {
    return (
      <tr>
        <td>
          <span>
            {new Date(this.props.session.time_start).toLocaleString()} bis
            <br />
            {new Date(this.props.session.time_end).toLocaleString()}
            {this.props.session.is_created_via_tracking ? (
              <TooltipIcon icon="fas fa-stopwatch" title="Diese Sitzung wurde via Aufzeichnung erstellt." className="ms-1"></TooltipIcon>
            ) : (
              <TooltipIcon icon="fas fa-pencil" title="Diese Sitzung wurde manuell erfasst." className="ms-1"></TooltipIcon>
            )}
          </span>
        </td>
        <td>
          <span>{this.getDurationDisplay()}</span>
        </td>
        <td>
          <span>{this.props.session.note}</span>
        </td>
        {/* Action: Edit */}
        <td>
          <a
            className="btn btn-outline-dark border-1"
            onClick={this.handleEditButtonClick}
            title="Sitzung bearbeiten"
          >
            <i className="fas fa-fw fa-pen-to-square"></i>
          </a>
        </td>
        {/* Action: Delete */}
        <td>
          <a
            className="btn btn-outline-danger border-1"
            onClick={this.handleDeleteButtonClick}
            title="Sitzung löschen"
          >
            <i className="fas fa-fw fa-trash"></i>
          </a>
        </td>
        {/* ID */}
        <td className="debug-only">{this.props.session.id}</td>
      </tr>
    );
  }
}

class WorkingTimeStats extends React.Component {
  constructor(props) {
    super(props);
    this.getDurationDisplay = this.getDurationDisplay.bind(this);
    this.apply = this.apply.bind(this);

    this.state = {
      start: new Date(new Date() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
    }
  }

  apply() {
    let start = new Date(document.getElementById("stats-range-start").value);
    let end = new Date(document.getElementById("stats-range-end").value);
    if (start > end) {
      errorAlert("Das Startdatum muss vor dem Enddatum liegen.");
      return;
    }
    this.setState({start, end})
  }

  getDurationDisplay() {
    let data = seconds2HoursMinutesSeconds(this.props.duration);
    return `${data.hours}h ${data.minutes}min ${data.seconds}s`;
  }

  render() {
    let filteredsessions = Stats.filterByDateRange(this.props.sessions, this.state.start, this.state.end);
    let data = Stats.chartDataByDays(filteredsessions, this.state.start, this.state.end);
    let totalHours = Stats.totalDuration(filteredsessions) / 3600;
    return [
      <div className="row row-cols-lg-auto m-1 g-2 align-items-center" key="settings">
        <div className="col-12">
          <div className="input-group">
            <div className="input-group-text">Von</div>
            <input
              type="datetime-local"
              className="form-control"
              id="stats-range-start"
              defaultValue={localInputFormat(new Date() - 7 * 24 * 60 * 60 * 1000)}
            />
          </div>
        </div>
        <div className="col-12">
          <div className="input-group">
            <div className="input-group-text">Bis</div>
            <input
              type="datetime-local"
              className="form-control"
              id="stats-range-end"
              defaultValue={localInputFormat(new Date())}
            />
          </div>
        </div>
        <div className="col-12">
          <button className="btn btn-outline-primary" onClick={this.apply}>Anwenden</button>
        </div>
        <div className="col-12">
          <span className="text-muted">Gesamtdauer: {totalHours.toFixed(2)}h</span>
        </div>
      </div>,
      <Recharts.ResponsiveContainer width="100%" height={300} key="chart">
        <Recharts.BarChart data={data} margin={{ top: 30, right: 20, left: 0, bottom: 5 }} width={500} height={300}>
          <Recharts.CartesianGrid strokeDasharray="3 3" />
          <Recharts.XAxis dataKey="name" />
          <Recharts.YAxis />
          <Recharts.Tooltip />
          <Recharts.Legend />
          <Recharts.Bar dataKey="duration_h" name="Dauer" unit="h" fill="#8884d8" />
        </Recharts.BarChart>
      </Recharts.ResponsiveContainer>,
    ];
  }
}

const DEFAULT_SESSION_TABLE_ROW_COUNT = 5;
const SESSION_TABLE_SHOW_MORE_INTERVAL = 3;

export default class Page_WorkingTime extends React.Component {
  constructor(props) {
    super(props);
    this.getTimeDisplay = this.getTimeDisplay.bind(this);
    this.createSession = this.createSession.bind(this);
    this.startSession = this.startSession.bind(this);
    this.stopSession = this.stopSession.bind(this);
    this.updateCurrentSession = this.updateCurrentSession.bind(this);
    this.renameCurrentSession = this.renameCurrentSession.bind(this);
    this.tick = this.tick.bind(this);
    this.showMoreRows = this.showMoreRows.bind(this);

    this.state = {
      timeDisplay: this.getTimeDisplay(),
      listCount: DEFAULT_SESSION_TABLE_ROW_COUNT,
    };

    this.clockRefreshIntervalID = 0;
    this.currentSessionRefreshIntervalId = 0;

    this.start_in_progress = false;
    this.stop_in_progress = false;
  }

  showMoreRows(amount) {
    this.setState({ listCount: this.state.listCount + amount });
  }

  async createSession() {
    await WorkingTime.createWorkSessionPopup(this.props.selectedTeam);
    Navigation.renderPage();
  }

  async startSession() {
    if (!this.start_in_progress) {
      this.start_in_progress = true;
      await WorkingTime.startTrackingSession(this.props.selectedTeamId).then(() => {
        Navigation.renderPage();
      }).catch(errorAlert);
      this.start_in_progress = false;
    }
  }

  async stopSession() {
    if (!this.stop_in_progress) {
      this.stop_in_progress = true;
      await WorkingTime.stopTrackingSession().then(() => {
        Navigation.renderPage();
      }).catch(errorAlert);
      this.stop_in_progress = false;
    }
  }

  async renameCurrentSession() {
    await WorkingTime.renameWorkSessionPopup(this.props.selectedTeam, this.props.current_worksession);
    Navigation.renderPage();
  }

  async updateCurrentSession() {
    const current = this.props.current_worksession;
    const updated = await WorkingTime.getTrackingSession();
    if (current !== undefined && current !== updated && (current === null || updated === null || current.id !== updated.id)) {
      Navigation.renderPage();
      WorkingTime.getMyWorkSessionsInTeam(this.props.selectedTeamId);
    }
  }

  getTimeDisplay() {
    if (this.props.current_worksession) {
      const now = new Date();
      const start = new Date(this.props.current_worksession.time_start);
      const timediff = now - start;
      const diff = ms2HoursMinutesSeconds(timediff);
      return `${diff.hours}:${diff.minutes}:${diff.seconds}`;
    } else {
      return "00:00:00";
    }
  }

  componentDidMount() {
    this.clockRefreshIntervalID = setInterval(() => this.tick(), 1000);
    this.updateCurrentSession();
    this.currentSessionRefreshIntervalId = setInterval(() => this.updateCurrentSession(), 15000);
  }

  componentWillUnmount() {
    clearInterval(this.clockRefreshIntervalID);
    clearInterval(this.currentSessionRefreshIntervalId);
  }

  tick() {
    let newDisplay = this.getTimeDisplay();
    if (this.state.timeDisplay !== newDisplay) {
      this.setState({ timeDisplay: newDisplay });
    }
  }

  render() {
    let rows;

    if (Cache.getCurrentTeamData()._state.me_worksessions._initial) {
      rows = (
        <tr>
          <td colSpan="3">Laden...</td>
        </tr>
      );
      WorkingTime.getMyWorkSessionsInTeam(this.props.selectedTeamId);
    } else {
      var worksessions = Object.values(this.props.worksessions);
      worksessions.sort((a, b) => {
        return new Date(b.time_start) - new Date(a.time_start);
      });

      if (worksessions.length === 0) {
        rows = (
          <tr>
            <td colSpan="3">Noch keine Zeiten erfasst.</td>
          </tr>
        );
      } else {
        let mapper = (session) => {
          return (
            <WorkSessionTableRow
              session={session}
              key={session.id}
              team={this.props.selectedTeam}
            />
          );
        };

        let canShowMore = worksessions.length > this.state.listCount;
        let canShowLess = this.state.listCount > DEFAULT_SESSION_TABLE_ROW_COUNT;

        if (canShowMore) {
          rows = worksessions.slice(0, this.state.listCount).map(mapper);
        } else {
          rows = worksessions.map(mapper);
        }

        if (canShowMore || canShowLess) {
          rows.push(
            <tr key="more-less" id="worksessions-show-moreless">
              <td colSpan="5">
                {canShowMore ? (
                  <a
                    href="#worksessions-show-moreless"
                    onClick={() =>
                      this.showMoreRows(SESSION_TABLE_SHOW_MORE_INTERVAL)
                    }
                    className="me-2"
                  >
                    Mehr anzeigen
                  </a>
                ) : (
                  null
                )}
                {canShowLess ? (
                  <a
                    href="#worksessions-show-moreless"
                    onClick={() =>
                      this.showMoreRows(-SESSION_TABLE_SHOW_MORE_INTERVAL)
                    }
                  >
                    Weniger anzeigen
                  </a>
                ) : (
                  null
                )}
              </td>
            </tr>
          );
        }
      }
    }

    return (
      <Dashboard.Dashboard
        title="Deine Arbeitszeit [Beta]"
        subtitle="Erfasse und verwalte deine Arbeitszeit"
      >
        <Dashboard.DashboardColumn sizes={{ lg: 3 }}>
          <Dashboard.DashboardRow>
            <Dashboard.DashboardColumn size="12" sizes={{ lg: 12, sm: 6, md: 6 }}>
              <Dashboard.DashboardTile title="Sitzung aufzeichnen">
                <h1 className="text-center">{this.state.timeDisplay}</h1>

                <div className="text-center">
                  {this.props.current_worksession ? (
                    <div className="row m-2 g-2">
                      <button className="btn btn-danger col" onClick={this.stopSession}>
                        Aufzeichnung&nbsp;beenden
                      </button>
                      <button className="btn btn-outline-dark col" onClick={this.renameCurrentSession}>
                        Aufzeichnung&nbsp;benennen
                      </button>
                    </div>
                  ) : (
                    <div className="row m-2">
                      <button className="btn btn-success col" onClick={this.startSession}>
                        Aufzeichnung&nbsp;starten
                      </button>
                    </div>
                  )}
                </div>
              </Dashboard.DashboardTile>
            </Dashboard.DashboardColumn>
            <Dashboard.DashboardColumn size="12" sizes={{ lg: 12, sm: 6, md: 6 }}>
              <Dashboard.DashboardTile title="Sitzung erfassen">
                <p className="ms-1">Aufzeichnung vergessen? Kein Problem. Hier können Sitzungen nachträglich manuell erfasst werden.</p>
                <div className="row m-2">
                  <button className="btn btn-outline-success col" onClick={this.createSession}>
                    Sitzung hinzufügen
                  </button>
                </div>
              </Dashboard.DashboardTile>
            </Dashboard.DashboardColumn>
          </Dashboard.DashboardRow>
        </Dashboard.DashboardColumn>
        <Dashboard.DashboardColumn sizes={{ lg: 9 }}>
          <Dashboard.DashboardTile title="Erfasste Zeiten">
            <table className="table table-borderless align-middle mb-0">
              <thead>
                <tr>
                  <th>Start &amp; Ende</th>
                  <th>Dauer</th>
                  <th>Notiz</th>
                  <th style={{width: "1px"}}></th>
                  <th style={{width: "1px"}}></th>
                  <th className="debug-only">ID</th>
                </tr>
              </thead>
              <tbody>{rows}</tbody>
            </table>
          </Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>

        <Dashboard.DashboardColumn>
          <Dashboard.DashboardTile title="Statistiken">
              <WorkingTimeStats
                sessions={Object.values(this.props.worksessions)}
              />
          </Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>
      </Dashboard.Dashboard>
    );
  }
}
