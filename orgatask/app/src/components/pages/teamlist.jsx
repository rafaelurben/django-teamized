"use strict";

import { validateUUID } from "../../utils/utils.js";
import { errorAlert, waitingAlert } from "../../utils/alerts.js";
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
              title="Zu Team wechseln"
            >
              <i className="far fa-fw fa-circle-check"></i>
            </a>
          </td>
        ) : (
          <td>
            <a
              className="btn btn-success disabled"
              title="Ausgewählt"
            >
              <i className="fas fa-fw fa-circle-check"></i>
            </a>
          </td>
        )}
        {/* Action: Edit */}
        {this.props.team.member.role === "owner" || this.props.team.member.role === "admin" ? (
          <td>
            <a
              className="btn btn-outline-dark border-1"
              onClick={this.handleManageButtonClick}
              title="Verwalten"
            >
              <i className="fas fa-fw fa-pen-to-square"></i>
            </a>
          </td>
        ) : (
          <td>
            <a
              className="btn btn-outline-dark border-1"
              onClick={this.handleManageButtonClick}
              title="Ansehen"
            >
              <i className="fas fa-fw fa-eye"></i>
            </a>
          </td>
        )}
        {/* Action: Leave/Delete */}
        {this.props.team.member.role !== "owner" ? (
          <td>
            <a
              className="btn btn-outline-danger border-1"
              onClick={this.handleLeaveButtonClick}
              title="Team verlassen"
            >
              <i className="fas fa-fw fa-right-from-bracket"></i>
            </a>
          </td>
        ) : (
          <td>
            <a
              className="btn btn-outline-danger border-1"
              onClick={this.handleDeleteButtonClick}
              title="Team löschen"
            >
              <i className="fas fa-fw fa-trash"></i>
            </a>
          </td>
        )}
        {/* ID */}
        <td className="debug-only">
          {this.props.team.id}
        </td>
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
    
    waitingAlert("Einladung wird geprüft...")
    Teams.checkInvitePopup(token);
  }

  render() {
    let rows = this.props.teams.map((team) => {
      return <TeamTableRow key={team.id} team={team} selectedTeamId={this.props.selectedTeamId} />;
    });

    const prefilledInviteToken = new URL(window.location.href).searchParams.get("invite", "");

    return (
      <Dashboard.Dashboard title="Deine Teams" subtitle="Verwalte deine Teams, erstelle ein neues oder trete einem bei.">
        <Dashboard.DashboardColumn>
          <Dashboard.DashboardTile title="Teamübersicht">
            <table className="table table-borderless align-middle mb-0">
              <thead>
                <tr>
                  <th>Name &amp; Beschreibung</th>
                  <th>Deine Rolle</th>
                  <th style={{width: "1px"}}></th>
                  <th style={{width: "1px"}}></th>
                  <th style={{width: "1px"}}></th>
                  <th className="debug-only">ID</th>
                </tr>
              </thead>
              <tbody>{rows}</tbody>
            </table>
          </Dashboard.DashboardTile>

          <Dashboard.DashboardTile title="Team erstellen oder beitreten">
            <p className="mx-1">Klicke auf "Team erstellen", um ein neues Team zu erstellen oder gib einen Einladungstoken ein und klicke auf "Team beitreten", um einem Team beizutreten.</p>
            <div className="input-group my-2 px-1">
              <button
                type="button"
                className="btn btn-outline-success border-1"
                onClick={Teams.createTeamPopup}
              >
                Team erstellen
              </button>
              <input
                id="invite-token"
                type="text"
                className="form-control"
                placeholder="Token der Einladung"
                defaultValue={prefilledInviteToken}
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
