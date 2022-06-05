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
            {new Date(this.props.session.time_start*1000).toLocaleString()}
          </span>
        </td>
        <td>
          <span>
            {new Date(this.props.session.time_end*1000).toLocaleString()}
          </span>
        </td>
        <td>
          <span>{this.getDurationDisplay()}</span>
        </td>
      </tr>
    );
  }
}

export default class Page_WorkingTime extends React.Component {
  constructor(props) {
    super(props);
    this.getTimeDisplay = this.getTimeDisplay.bind(this);
    this.startSession = this.startSession.bind(this);
    this.stopSession = this.stopSession.bind(this);
    this.fetchSessions = this.fetchSessions.bind(this);
    this.tick = this.tick.bind(this);

    this.state = { timeDisplay: this.getTimeDisplay() };
    this.clockRefreshIntervalID = 0;

    this.fetch_in_progress = false;
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

  startSession() {
    WorkingTime.startTrackingSession(this.props.selectedTeamId).then(() => {
      Navigation.renderPage();
    }).catch(errorAlert);
  }

  stopSession() {
    WorkingTime.stopTrackingSession().then(() => {
      Navigation.renderPage();
    }).catch(errorAlert);
  }

  getTimeDisplay() {
    if (this.props.current_worksession) {
      const now = new Date();
      const start = new Date(this.props.current_worksession.time_start * 1000);
      const timediff = now - start;
      const diff = ms2HoursMinutesSeconds(timediff);
      return `${diff.hours}:${diff.minutes}:${diff.seconds}`;
    } else {
      return "00:00:00";
    }
  }

  componentDidMount() {
    this.clockRefreshIntervalID = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.clockRefreshIntervalID);
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
          <WorkSessionTableRow session={session} key={session.id} />
        );
      });
    }

    return (
      <Dashboard.Dashboard
        title="Deine Arbeitszeit"
        subtitle="Erfasse und verwalte deine Arbeitszeit"
      >
        <Dashboard.DashboardColumn sizes={{lg: 3}}>
          <Dashboard.DashboardTile title="Zeit erfassen">
              <h1 className="text-center">{this.state.timeDisplay}</h1>

              <div className="text-center">
                {
                  this.props.current_worksession ? (
                    <button className="btn btn-danger" onClick={this.stopSession}>
                      Zeitmessung beenden
                    </button>
                  ) : (
                    <button className="btn btn-success" onClick={this.startSession}>
                      Zeitmessung starten
                    </button>
                  )
                }
              </div>
          </Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>
        <Dashboard.DashboardColumn sizes={{lg: 9}}>
          <Dashboard.DashboardTile title="Erfasste Zeiten">
            <table className="table table-borderless align-middle mb-0">
              <thead>
                <tr>
                  <th>Start</th>
                  <th>Ende</th>
                  <th>Dauer</th>
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
