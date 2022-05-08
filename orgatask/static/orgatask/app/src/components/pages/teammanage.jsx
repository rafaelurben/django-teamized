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

  handlePromoteButtonClick() {
    Teams.promoteMemberWithConfirmation(this.props.team, this.props.member);
    Navigation.renderPage();
  }

  handleDemoteButtonClick() {
    Teams.demoteMemberWithConfirmation(this.props.team, this.props.member);
    Navigation.renderPage();
  }

  handleLeaveButtonClick() {
    Teams.leaveTeamWithConfirmation(this.props.team);
    Navigation.renderPage();
  }

  handleRemoveButtonClick() {
    Teams.deleteMemberWithConfirmation(this.props.team, this.props.member);
    Navigation.renderPage();
  }

  handleTeamDeleteButtonClick() {
    Teams.deleteTeamWithConfirmation(this.props.team);
    Navigation.renderPage();
  }

  render() {
    let member = this.props.member;
    let loggedinmember = this.props.loggedinmember;

    return (
      <tr>
        {/* Name and description */}
        <td className="py-2">
          <b>
            {`${member.user.last_name} ${member.user.first_name}`}
          </b>
          <br />
          <span>{member.user.email}</span>
        </td>
        {/* Member role */}
        <td>
          <b>{member.role_text}</b>
        </td>
        {/* Action: Promote/Demote */}
        {
          loggedinmember.role === "owner" &&
          member.role !== "owner" ? (
            member.role === "member" ? (
              <td>
                <a
                  href="#"
                  className="btn btn-outline-dark border-1"
                  onClick={this.handlePromoteButtonClick}
                >
                  Befördern
                </a>
              </td>
            ) : (
              <td>
                <a
                  href="#"
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
                  href="#"
                  className="btn btn-outline-danger border-1"
                  onClick={this.handleTeamDeleteButtonClick}
                >
                  Team löschen
                </a>
              </td>
            ) : (
              <td>
                <a
                  href="#"
                  className="btn btn-outline-danger border-1"
                  onClick={this.handleLeaveButtonClick}
                >
                  Verlassen
                </a>
              </td>
            )
          ) : (
            loggedinmember.role === "owner" ||
            (loggedinmember.role === "admin" && member.role === "member") ? (
              <td>
                <a
                  href="#"
                  className="btn btn-outline-danger border-1"
                  onClick={this.handleRemoveButtonClick}
                >
                  Entfernen
                </a>
              </td>
            ) : (
              <td></td>
            )
          )
        }
      </tr>
    );
  }
}

export default class Page_TeamManage extends React.Component {
  constructor(props) {
    super(props);
    this.createInviteSwal = this.createInviteSwal.bind(this);
  }

  createInviteSwal() {
    Teams.createInviteSwal(this.props.team);
  }

  render() {
    let memberrows = Object.values(this.props.members).map((member) => {
      return (
        <TeamMembersTableRow
          key={member.id}
          team={this.props.team}
          member={member}
          loggedinmember={this.props.team.member}
        />
      );
    });

    // let inviterows = this.props.teams.map((team) => {
    //   return (
    //     <TeamInvitesTableRow
    //       key={team.id}
    //       team={team}
    //       selectedTeamId={this.props.selectedTeamId}
    //     />
    //   );
    // });

    return (
      <Dashboard.Dashboard title="Dein Team" subtitle={this.props.team.name} text={this.props.team.description}>
        <Dashboard.DashboardColumn size="12">
          <Dashboard.DashboardTile>
            <table className="table table-borderless align-middle mb-0">
              <tbody>
                {memberrows}
              </tbody>
            </table>
          </Dashboard.DashboardTile>

          {
            this.props.team.member.role === "owner" ? (
              <Dashboard.DashboardTile>
                <table className="table table-borderless align-middle mb-0">
                  <tbody>
                    {/* {inviterows} */}
                    <tr>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-primary border-1"
                          onClick={this.createInviteSwal}
                        >
                          Einladung erstellen
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Dashboard.DashboardTile>
            ) : (<wbr></wbr>)
          }
        </Dashboard.DashboardColumn>
      </Dashboard.Dashboard>
    );
  }
}
