"use strict";

import { padZero } from "../../utils/utils.js";
import { errorAlert } from "../../utils/alerts.js";
import * as Navigation from "../../utils/navigation.js";
import * as WorkingTime from "../../utils/workingtime.js";
import * as Dashboard from "../dashboard.js";

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
  }

  fetchSessions() {
    WorkingTime.getWorkSessionsInTeam(this.props.selectedTeamId).then(() => {
      Navigation.renderPage();
    })
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
      const diff = {
        hours: padZero(Math.floor(timediff / 1000 / 60 / 60), 2),
        minutes: padZero(Math.floor(timediff / 1000 / 60) % 60, 2),
        seconds: padZero(Math.floor(timediff / 1000) % 60, 2),
      };
      return `${diff.hours}:${diff.minutes}:${diff.seconds}`;
    } else {
      return "00:00:00";
    }
  }

  componentDidMount() {
    if (this.props.worksessions === undefined) {
      this.fetchSessions();
    }
    this.clockRefreshIntervalID = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.clockRefreshIntervalID);
  }

  tick() {
    this.setState({ timeDisplay: this.getTimeDisplay() });
  }

  render() {
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
          <Dashboard.DashboardTile title="Erfasste Zeiten"></Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>
      </Dashboard.Dashboard>
    );
  }
}
