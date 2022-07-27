"use strict";

import { successAlert } from "../../utils/alerts.js";
import * as Teams from "../../utils/teams.js";
import * as Navigation from "../../utils/navigation.js";
import * as Dashboard from "../dashboard.js";
import { HoverInfo } from "../utils.js";


class TeamMembersTableRow extends React.Component {
  constructor(props) {
    super(props);
    this.handlePromoteButtonClick = this.handlePromoteButtonClick.bind(this);
    this.handleDemoteButtonClick = this.handleDemoteButtonClick.bind(this);
    this.handleLeaveButtonClick = this.handleLeaveButtonClick.bind(this);
    this.handleRemoveButtonClick = this.handleRemoveButtonClick.bind(this);
  }

  async handlePromoteButtonClick() {
    await Teams.promoteMemberPopup(this.props.team, this.props.member);
    Navigation.renderPage();
  }

  async handleDemoteButtonClick() {
    await Teams.demoteMemberPopup(this.props.team, this.props.member);
    Navigation.renderPage();
  }

  async handleLeaveButtonClick() {
    const response = await Teams.leaveTeamPopup(this.props.team);
    if (response.isConfirmed) {
      Navigation.selectPage("teamlist");
    }
  }

  async handleRemoveButtonClick() {
    await Teams.deleteMemberPopup(this.props.team, this.props.member);
    Navigation.renderPage();
  }

  render() {
    let member = this.props.member;
    let loggedinmember = this.props.loggedinmember;

    return (
      <tr>
        {/* Avatar */}
        <td>
          <img
            src={member.user.avatar_url}
            alt={`Avatar von ${member.username}`}
            width="32"
            height="32"
            className="rounded-circle"
          />
        </td>
        {/* Name and description */}
        <td>
          <span>
            {member.user.first_name} {member.user.last_name}
          </span>
        </td>
        {/* Username and email */}
        <td className="py-2">
          <span>{member.user.username}</span>
          <br />
          <a href={"mailto:" + member.user.email}>{member.user.email}</a>
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
          loggedinmember.role !== "owner" ? (
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
            <td></td>
          )
        ) : loggedinmember.role === "owner" ||
          (loggedinmember.role === "admin" && member.role === "member") ? (
          <td>
            <a
              className="btn btn-outline-danger border-1"
              onClick={this.handleRemoveButtonClick}
              title="Mitglied entfernen"
            >
              <i className="fas fa-fw fa-trash"></i>
            </a>
          </td>
        ) : (
          <td></td>
        )}
        {/* ID */}
        <td className="debug-only">
          {member.id}
        </td>
      </tr>
    );
  }
}

class TeamInvitesTableRow extends React.Component {
  constructor(props) {
    super(props);
    this.inviteurl = window.location.href.split("?")[0] + "?invite=" + this.props.invite.token;
    this.handleDeleteButtonClick = this.handleDeleteButtonClick.bind(this);
    this.handleEditButtonClick = this.handleEditButtonClick.bind(this);
    this.copyToken = this.copyToken.bind(this);
    this.copyURL = this.copyURL.bind(this);
  }

  async handleDeleteButtonClick() {
    await Teams.deleteInvitePopup(this.props.team, this.props.invite);
    Navigation.renderPage();
  }

  async handleEditButtonClick() {
    await Teams.editInvitePopup(this.props.team, this.props.invite);
    Navigation.renderPage();
  }

  copyToken() {
    navigator.clipboard.writeText(this.props.invite.token);
    successAlert("Der Token wurde in die Zwischenablage kopiert.", "Token kopiert");
  }

  copyURL() {
    navigator.clipboard.writeText(this.inviteurl);
    successAlert("Der Link wurde in die Zwischenablage kopiert.", "Link kopiert");
  }

  render() {
    let invite = this.props.invite;

    return (
      <tr>
        {/* Note */}
        <td>
          <span>{invite.note}</span>
        </td>
        {/* Share */}
        <td>
          <abbr title={invite.token} className="me-1" onClick={this.copyToken}>
            <i className="fas fa-key"></i>
          </abbr>
          <abbr title={this.inviteurl} onClick={this.copyURL}>
            <i className="fas fa-link"></i>
          </abbr>
        </td>
        {/* Valid until */}
        <td>
          <span>{invite.valid_until ? new Date(invite.valid_until).toLocaleString() : "\u221e"}</span>
        </td>
        {/* Uses */}
        <td className="text-align-end">
          <span>
            {invite.uses_used}/{invite.uses_left}
          </span>
        </td>
        {/* Action: Edit */}
        <td>
          <a
            className="btn btn-outline-dark border-1"
            onClick={this.handleEditButtonClick}
            title="Einladung bearbeiten"
          >
            <i className="fas fa-fw fa-pen-to-square"></i>
          </a>
        </td>
        {/* Action: Delete */}
        <td>
          <a
            className="btn btn-outline-danger border-1"
            onClick={this.handleDeleteButtonClick}
            title="Einladung löschen"
          >
            <i className="fas fa-fw fa-trash"></i>
          </a>
        </td>
        {/* ID */}
        <td className="debug-only">{invite.id}</td>
      </tr>
    );
  }
}

export default class Page_TeamManage extends React.Component {
  constructor(props) {
    super(props);
    this.handleInviteCreateButtonClick = this.handleInviteCreateButtonClick.bind(this);
    this.handleTeamEditButtonClick = this.handleTeamEditButtonClick.bind(this);
    this.handleTeamDeleteButtonClick = this.handleTeamDeleteButtonClick.bind(this);
  }

  async handleInviteCreateButtonClick() {
    await Teams.createInvitePopup(this.props.team);
    Navigation.renderPage();
  }

  async handleTeamEditButtonClick() {
    await Teams.editTeamPopup(this.props.team);
    Navigation.renderPage();
  }

  async handleTeamDeleteButtonClick() {
    const response = await Teams.deleteTeamPopup(this.props.team);
    if (response.isConfirmed) {
      Navigation.selectPage("teamlist");
    }
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
          <td colSpan="4">Keine Einladungen vorhanden</td>
        </tr>
      );
    }

    let inforows = [
      <tr key="name">
        <th>Name:</th>
        <td>{this.props.team.name}</td>
      </tr>,
      <tr key="description" style={{ whiteSpace: "pre" }}>
        <th>Beschreibung:</th>
        <td>{this.props.team.description}</td>
      </tr>,
      <tr key="id" className="debug-only">
        <th>ID:</th>
        <td>{this.props.team.id}</td>
      </tr>,
    ];

    if (this.props.team.member.role === "owner") {
      inforows.push(
        <tr key="settings">
          <th>Einstellungen:</th>
          <td>
            <a
              className="btn btn-outline-dark border-1"
              onClick={this.handleTeamEditButtonClick}
            >
              Team bearbeiten
            </a>
            <a
              className="btn btn-outline-danger border-1 ms-1"
              onClick={this.handleTeamDeleteButtonClick}
            >
              Team löschen
            </a>
          </td>
        </tr>
      );
    }

    return (
      <Dashboard.Dashboard
        title="Dein Team"
        subtitle="Infos über dein ausgewähltes Team."
      >
        <Dashboard.DashboardColumn>
          <Dashboard.DashboardTile title="Teaminfos">
            <table className="table table-borderless mb-0">
              <tbody>{inforows}</tbody>
            </table>
          </Dashboard.DashboardTile>

          <Dashboard.DashboardTile title="Mitglieder">
            <table className="table table-borderless align-middle mb-0">
              <thead>
                <tr>
                  <th width="32px" className="text-center"><HoverInfo title="Das Profilbild wird anhand der E-Mail-Adresse auf gravatar.com abgerufen" /></th>
                  <th>Name</th>
                  <th>Benutzername &amp; E-Mail</th>
                  <th>Rolle</th>
                  <th style={{width: "1px"}}></th>
                  <th style={{width: "1px"}}></th>
                  <th className="debug-only">ID</th>
                </tr>
              </thead>
              <tbody>{memberrows}</tbody>
            </table>
          </Dashboard.DashboardTile>

          {this.props.team.member.role === "owner" ? (
            <Dashboard.DashboardTile title="Einladungen">
              <table className="table table-borderless align-middle mb-0">
                <thead>
                  <tr>
                    <th>Notiz</th>
                    <th>Teilen <HoverInfo title="Auf Icons klicken, um Token bzw. Link zu kopieren" /></th>
                    <th>Gültig bis</th>
                    <th>Verwendungen <HoverInfo title="Bereits verwendet / noch verfügbar" /></th>
                    <th style={{width: "1px"}}></th>
                    <th style={{width: "1px"}}></th>
                    <th className="debug-only">ID</th>
                  </tr>
                </thead>
                <tbody>
                  {inviterows}
                  <tr>
                    <td colSpan="6">
                      <button
                        type="button"
                        className="btn btn-outline-success border-1"
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
            null
          )}
        </Dashboard.DashboardColumn>
      </Dashboard.Dashboard>
    );
  }
}
