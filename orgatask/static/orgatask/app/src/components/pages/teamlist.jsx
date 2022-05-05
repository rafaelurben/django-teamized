"use strict";

import * as Teams from "../../utils/teams.js";
import * as Navigation from "../../utils/navigation.js";


/*
    The Page_TeamList component represents the "teamlist" page.
    The TeamTableRow represents a single row in the team table on the team list.
*/

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
    Teams.leaveTeamWithConfirmation(this.props.team);
  }

  handleDeleteButtonClick() {
    Teams.deleteTeamWithConfirmation(this.props.team);
  }

  render() {
    return (
      <tr>
        {/* Title and description */}
        <td className="py-2">
          <b>{this.props.team.title}</b>
          <br />
          <span>{this.props.team.description}</span>
        </td>
        {/* Member role */}
        <td>
          <b>{this.props.team.member.role_text}</b>
        </td>
        {/* Action: Switch to */}
        {this.props.team.id !== this.props.selectedTeamId ? (
          <td>
            <a
              href="#"
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
              href="#"
              className="btn btn-outline-dark border-1"
              onClick={this.handleManageButtonClick}
            >
              Verwalten
            </a>
          </td>
        ) : (
          <td>
            <a
              href="#"
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
              href="#"
              className="btn btn-outline-danger border-1"
              onClick={this.handleLeaveButtonClick}
            >
              Verlassen
            </a>
          </td>
        ) : (
          <td>
            <a
              href="#"
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

  render() {
    let rows = this.props.teams.map((team) => {
      return <TeamTableRow key={team.id} team={team} selectedTeamId={this.props.selectedTeamId} />;
    });

    return (
      <div>
        <table className="table table-borderless align-middle">
            <tbody>{rows}</tbody>
        </table>
        
        <div className="w-100 border border-dark rounded p-2">
          <span className="mx-3">Neues Team:</span>
          <a
            href="#"
            className="m-2 btn btn-outline-primary border-1"
            onClick={Teams.createTeamSwal}
          >
            Team erstellen
          </a>
        </div>
      </div>
    );
  }
}
