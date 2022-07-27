"use strict";

import { ms2HoursMinutesSeconds, seconds2HoursMinutesSeconds } from "../../utils/utils.js";
import { errorAlert } from "../../utils/alerts.js";
import * as Navigation from "../../utils/navigation.js";
import * as WorkingTime from "../../utils/workingtime.js";
import * as Dashboard from "../dashboard.js";

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

export default class Page_WorkingTime extends React.Component {
  constructor(props) {
    super(props);
    this.getTimeDisplay = this.getTimeDisplay.bind(this);
    this.createSession = this.createSession.bind(this);
    this.startSession = this.startSession.bind(this);
    this.stopSession = this.stopSession.bind(this);
    this.fetchSessions = this.fetchSessions.bind(this);
    this.updateSession = this.updateSession.bind(this);
    this.tick = this.tick.bind(this);

    this.state = { timeDisplay: this.getTimeDisplay() };
    this.clockRefreshIntervalID = 0;

    this.currentSessionRefreshIntervalId = 0;
    this.fetch_in_progress = false;
    this.start_in_progress = false;
    this.stop_in_progress = false;
  }

  fetchSessions() {
    if (!this.fetch_in_progress) {
      this.fetch_in_progress = true;
      WorkingTime.getWorkSessionsInTeam(this.props.selectedTeamId).then(() => {
        Navigation.renderPage();
        this.fetch_in_progress = false;
      })
    }
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

  async updateSession() {
    const current = this.props.current_worksession;
    const updated = await WorkingTime.getTrackingSession();
    if (current !== undefined && current !== updated && (current === null || updated === null || current.id !== updated.id)) {
      Navigation.renderPage();
      this.fetchSessions();
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
    this.updateSession();
    this.currentSessionRefreshIntervalId = setInterval(() => this.updateSession(), 15000);
  }

  componentWillUnmount() {
    clearInterval(this.clockRefreshIntervalID);
    clearInterval(this.currentSessionRefreshIntervalId);
  }

  tick() {
    this.setState({ timeDisplay: this.getTimeDisplay() });
  }

  render() {
    let rows;
    if (this.props.worksessions === undefined) {
      rows = <tr><td colSpan="3">Wird geladen...</td></tr>;
      this.fetchSessions();
    } else if (this.props.worksessions.length === 0) {
      rows = <tr><td colSpan="3">Noch keine Zeiten erfasst.</td></tr>;
    } else {
      rows = this.props.worksessions.map((session) => {
        return (
          <WorkSessionTableRow session={session} key={session.id} team={this.props.selectedTeam} />
        );
      });
    }

    return (
      <Dashboard.Dashboard
        title="Deine Arbeitszeit"
        subtitle="(w.i.p.) Erfasse und verwalte deine Arbeitszeit"
      >
        <Dashboard.DashboardColumn sizes={{ lg: 3 }}>
          <Dashboard.DashboardRow>
            <Dashboard.DashboardColumn size="12" sizes={{ lg: 12, sm: 6, md: 6 }}>
              <Dashboard.DashboardTile title="Sitzung aufzeichnen">
                <h1 className="text-center">{this.state.timeDisplay}</h1>

                <div className="text-center">
                  {this.props.current_worksession ? (
                    <button className="btn btn-danger" onClick={this.stopSession}>
                      Zeitmessung beenden
                    </button>
                  ) : (
                    <button className="btn btn-success" onClick={this.startSession}>
                      Zeitmessung starten
                    </button>
                  )}
                </div>
              </Dashboard.DashboardTile>
            </Dashboard.DashboardColumn>
            <Dashboard.DashboardColumn size="12" sizes={{ lg: 12, sm: 6, md: 6 }}>
              <Dashboard.DashboardTile title="Sitzung erfassen">
                <div className="text-center">
                  <button className="btn btn-outline-success" onClick={this.createSession}>
                    Sitzung hinzufügen
                  </button>
                </div>
              </Dashboard.DashboardTile>
            </Dashboard.DashboardColumn>
          </Dashboard.DashboardRow>
        </Dashboard.DashboardColumn>
        <Dashboard.DashboardColumn sizes={{ lg: 9 }}>
          <Dashboard.DashboardTile title="Erfasste Zeiten (ausgewähltes Team)">
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
      </Dashboard.Dashboard>
    );
  }
}
