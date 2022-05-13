"use strict";

import { errorAlert } from "../../utils/alerts.js";
import * as Teams from "../../utils/teams.js";
import * as Navigation from "../../utils/navigation.js";
import * as Dashboard from "../dashboard.js";


class TeamMembersTableRow extends React.Component {
  constructor(props) {
    super(props);
    this.handlePromoteButtonClick = this.handlePromoteButtonClick.bind(this);
    this.handleDemoteButtonClick = this.handleDemoteButtonClick.bind(this);
    this.handleLeaveButtonClick = this.handleLeaveButtonClick.bind(this);
    this.handleRemoveButtonClick = this.handleRemoveButtonClick.bind(this);
    this.handleTeamDeleteButtonClick = this.handleTeamDeleteButtonClick.bind(this);
  }

  async handlePromoteButtonClick() {
    await Teams.promoteMemberPopup(this.props.team, this.props.member);
    Navigation.renderPage();
  }

  async handleDemoteButtonClick() {
    await Teams.demoteMemberPopup(this.props.team, this.props.member);
    Navigation.renderPage();
  }

  handleLeaveButtonClick() {
    Teams.leaveTeamPopup(this.props.team);
  }

  async handleRemoveButtonClick() {
    await Teams.deleteMemberPopup(this.props.team, this.props.member);
    Navigation.renderPage();
  }

  handleTeamDeleteButtonClick() {
    Teams.deleteTeamPopup(this.props.team);
  }

  render() {
    let member = this.props.member;
    let loggedinmember = this.props.loggedinmember;

    return (
      <tr>
        {/* Name and description */}
        <td className="py-2">
          <span>{`${member.user.last_name} ${member.user.first_name}`}</span>
          <br />
          <i>{member.user.email}</i>
        </td>
        {/* Member role */}
        <td>
          <span>{member.role_text}</span>
        </td>
        {/* Action: Promote/Demote */}
        {loggedinmember.role === "owner" && member.role !== "owner" ? (
          member.role === "member" ? (
            <td>
              <a
                className="btn btn-outline-dark border-1"
                onClick={this.handlePromoteButtonClick}
              >
                Befördern
              </a>
            </td>
          ) : (
            <td>
              <a
                className="btn btn-outline-dark border-1"
                onClick={this.handleDemoteButtonClick}
              >
                Degradieren
              </a>
            </td>
          )
        ) : (
          <td></td>
        )}
        {/* Action: Leave/Delete */}
        {member.id === loggedinmember.id ? (
          loggedinmember.role === "owner" ? (
            <td>
              <a
                className="btn btn-outline-danger border-1"
                onClick={this.handleTeamDeleteButtonClick}
              >
                Team löschen
              </a>
            </td>
          ) : (
            <td>
              <a
                className="btn btn-outline-danger border-1"
                onClick={this.handleLeaveButtonClick}
              >
                Verlassen
              </a>
            </td>
          )
        ) : loggedinmember.role === "owner" ||
          (loggedinmember.role === "admin" && member.role === "member") ? (
          <td>
            <a
              className="btn btn-outline-danger border-1"
              onClick={this.handleRemoveButtonClick}
            >
              Entfernen
            </a>
          </td>
        ) : (
          <td></td>
        )}
      </tr>
    );
  }
}

class TeamInvitesTableRow extends React.Component {
  constructor(props) {
    super(props);
    this.handleDeleteButtonClick = this.handleDeleteButtonClick.bind(this);
    this.handleEditButtonClick = this.handleEditButtonClick.bind(this);
  }

  async handleDeleteButtonClick() {
    await Teams.deleteInvitePopup(this.props.team, this.props.invite);
    Navigation.renderPage();
  }

  async handleEditButtonClick() {
    await Teams.editInvitePopup(this.props.team, this.props.invite);
    Navigation.renderPage();
  }

  render() {
    let invite = this.props.invite;

    return (
      <tr>
        {/* Token and note */}
        <td className="py-2">
          <span>{`${invite.token}`}</span>
          <br />
          <i>{invite.note}</i>
        </td>
        {/* Valid until */}
        <td>
          <span>{new Date(invite.valid_until*1000).toLocaleString()}</span>
        </td>
        {/* Uses */}
        <td className="text-align-end">
          <span>{invite.uses_used}/{invite.uses_left}</span>
        </td>
        {/* Action: Edit */}
        <td>
          <a
            className="btn btn-outline-dark border-1"
            onClick={this.handleEditButtonClick}
          >
            Bearbeiten
          </a>
        </td>
        {/* Action: Delete */}
        <td>
          <a
            className="btn btn-outline-danger border-1"
            onClick={this.handleDeleteButtonClick}
          >
            Einladung löschen
          </a>
        </td>
      </tr>
    );
  }
}

export default class Page_TeamManage extends React.Component {
  constructor(props) {
    super(props);
    this.handleInviteCreateButtonClick = this.handleInviteCreateButtonClick.bind(this);
  }

  async handleInviteCreateButtonClick() {
    await Teams.createInvitePopup(this.props.team);
    Navigation.renderPage();
  }

  render() {
    let memberrows = Object.values(this.props.members).map((member) => {
      return (
        <TeamMembersTableRow
          key={member.id}
          member={member}
          team={this.props.team}
          loggedinmember={this.props.team.member}
        />
      );
    });

    let inviterows = Object.values(this.props.invites).map((invite) => {
      return (
        <TeamInvitesTableRow 
          key={invite.id}
          invite={invite}
          team={this.props.team}
        />
      );
    });

    if (inviterows.length == 0) {
      inviterows = (
        <tr>
          <td>Keine Einladungen vorhanden</td>
        </tr>
      );
    }

    return (
      <Dashboard.Dashboard
        title="Dein Team"
        subtitle="Überblick über die Mitglieder deines Teams."
      >
        <Dashboard.DashboardColumn size="12">
          <Dashboard.DashboardTile>
            <table className="table table-borderless align-middle mb-0">
              <thead>
                <tr>
                  <th>Name &amp; E-Mail</th>
                  <th>Rolle</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>{memberrows}</tbody>
            </table>
          </Dashboard.DashboardTile>

          {this.props.team.member.role === "owner" ? (
            <Dashboard.DashboardTile>
              <table className="table table-borderless align-middle mb-0">
                <thead>
                  <tr>
                    <th>Token &amp; Notiz</th>
                    <th>Gültig bis</th>
                    <th>Verwendungen</th>
                  </tr>
                </thead>
                <tbody>
                  {inviterows}
                  <tr>
                    <td>
                      <button
                        type="button"
                        className="btn btn-outline-primary border-1"
                        onClick={this.handleInviteCreateButtonClick}
                      >
                        Einladung erstellen
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Dashboard.DashboardTile>
          ) : (
            <wbr></wbr>
          )}
        </Dashboard.DashboardColumn>
      </Dashboard.Dashboard>
    );
  }
}
