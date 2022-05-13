"use strict";

import { validateUUID } from "../../utils/utils.js";
import { errorAlert } from "../../utils/alerts.js";
import * as Teams from "../../utils/teams.js";
import * as Navigation from "../../utils/navigation.js";
import * as Dashboard from "../dashboard.js";

class TeamTableRow extends React.Component {
  constructor(props) {
    super(props);
    this.handleSwitchToButtonClick = this.handleSwitchToButtonClick.bind(this);
    this.handleManageButtonClick = this.handleManageButtonClick.bind(this);
    this.handleLeaveButtonClick = this.handleLeaveButtonClick.bind(this);
    this.handleDeleteButtonClick = this.handleDeleteButtonClick.bind(this);
  }

  handleSwitchToButtonClick() {
    Teams.switchTeam(this.props.team.id);
  }

  handleManageButtonClick() {
    Teams.switchTeam(this.props.team.id);
    Navigation.selectPage("teammanage");
  }

  handleLeaveButtonClick() {
    Teams.leaveTeamPopup(this.props.team);
  }

  handleDeleteButtonClick() {
    Teams.deleteTeamPopup(this.props.team);
  }

  render() {
    return (
      <tr>
        {/* Name and description */}
        <td className="py-2">
          <span>{this.props.team.name}</span>
          <br />
          <i>{this.props.team.description}</i>
        </td>
        {/* Member role */}
        <td>
          <span>{this.props.team.member.role_text}</span>
        </td>
        {/* Action: Switch to */}
        {this.props.team.id !== this.props.selectedTeamId ? (
          <td>
            <a
              className="btn btn-outline-success border-1"
              onClick={this.handleSwitchToButtonClick}
            >
              Wechseln zu
            </a>
          </td>
        ) : (
          <td></td>
        )}
        {/* Action: Manage */}
        {this.props.team.member.role === "owner" ||
        this.props.team.member.role === "admin" ? (
          <td>
            <a
              className="btn btn-outline-dark border-1"
              onClick={this.handleManageButtonClick}
            >
              Verwalten
            </a>
          </td>
        ) : (
          <td>
            <a
              className="btn btn-outline-dark border-1"
              onClick={this.handleManageButtonClick}
            >
              Ansehen
            </a>
          </td>
        )}
        {/* Action: Leave/Delete */}
        {this.props.team.member.role !== "owner" ? (
          <td>
            <a
              className="btn btn-outline-danger border-1"
              onClick={this.handleLeaveButtonClick}
            >
              Verlassen
            </a>
          </td>
        ) : (
          <td>
            <a
              className="btn btn-outline-danger border-1"
              onClick={this.handleDeleteButtonClick}
            >
              Löschen
            </a>
          </td>
        )}
      </tr>
    );
  }
}

export default class Page_TeamList extends React.Component {
  constructor(props) {
    super(props);
  }

  joinTeam() {
    let tokeninput = document.getElementById("invite-token");
    let token = tokeninput.value;
    
    if (!validateUUID(token)) {
      errorAlert(
        "Ungültiges Format",
        "Der Token muss dem UUID-Format entsprechen."
      );
    } else {
      Teams.acceptInvite(token);
      tokeninput.value = "";
    }
  }

  render() {
    let rows = this.props.teams.map((team) => {
      return <TeamTableRow key={team.id} team={team} selectedTeamId={this.props.selectedTeamId} />;
    });


    return (
      <Dashboard.Dashboard title="Deine Teams" subtitle="Verwalte deine Teams, erstelle ein neues oder trete einem bei.">
        <Dashboard.DashboardColumn size="12">
          <Dashboard.DashboardTile>
            <table className="table table-borderless align-middle mb-0">
              <thead>
                <tr>
                  <th>Name &amp; Beschreibung</th>
                  <th>Rolle</th>
                </tr>
              </thead>
              <tbody>{rows}</tbody>
            </table>
          </Dashboard.DashboardTile>

          <Dashboard.DashboardTile>
            <div className="input-group my-2">
              <button
                type="button"
                className="btn btn-outline-primary border-1"
                onClick={Teams.createTeamPopup}
              >
                Team erstellen
              </button>
              <input
                id="invite-token"
                type="text"
                className="form-control"
                placeholder="Token der Einladung"
              />
              <button
                type="button"
                className="btn btn-outline-primary border-1"
                onClick={this.joinTeam}
              >
                Team beitreten
              </button>
            </div>
          </Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>
      </Dashboard.Dashboard>
    );
  }
}
