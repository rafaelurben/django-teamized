"use strict";

import { ms2HoursMinutesSeconds, seconds2HoursMinutesSeconds } from "../../utils/utils.js";
import { errorAlert } from "../../utils/alerts.js";
import * as Navigation from "../../utils/navigation.js";
import * as WorkingTime from "../../utils/workingtime.js";
import * as Cache from "../../utils/cache.js";
import * as Dashboard from "../dashboard.js";
import { TooltipIcon } from "../tooltips.js";

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

        if (worksessions.length > this.state.listCount) {
          rows = worksessions.slice(0, this.state.listCount).map(mapper);
        } else {
          rows = worksessions.map(mapper);
        }

        rows.push(
          <tr key="more-less" id="worksessions-show-moreless">
            <td colSpan="5">
              {worksessions.length > this.state.listCount ? (
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
                ""
              )}
              {this.state.listCount > DEFAULT_SESSION_TABLE_ROW_COUNT ? (
                <a
                  href="#worksessions-show-moreless"
                  onClick={() =>
                    this.showMoreRows(-SESSION_TABLE_SHOW_MORE_INTERVAL)
                  }
                >
                  Weniger anzeigen
                </a>
              ) : (
                ""
              )}
            </td>
          </tr>
        );
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
