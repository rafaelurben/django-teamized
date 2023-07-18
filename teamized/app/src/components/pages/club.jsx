"use strict";

/**
 * Club page component
 */

import * as Dashboard from "../dashboard.js";
import * as Cache from "../../utils/cache.js";
import * as Club from "../../utils/club.js";
import * as Navigation from "../../utils/navigation.js";


class ClubMembersTableRow extends React.Component {
  constructor(props) {
    super(props);
    this.handleRemoveButtonClick = this.handleRemoveButtonClick.bind(this);
  }

  async handleRemoveButtonClick() {
    await Club.deleteClubMemberPopup(this.props.team, this.props.member);
    Navigation.renderPage();
  }

  render() {
    let member = this.props.member;
    let loggedinmember = this.props.loggedinmember;

    return (
      <tr>
        {/* Name */}
        <td>
          <span>
            {member.first_name} {member.last_name}
          </span>
        </td>
        {/* Email */}
        <td>
          <a href={"mailto:" + member.user.email}>{member.user.email}</a>
        </td>
        {/* Action: Delete */}
        {loggedinmember.role === "owner" || loggedinmember.role === "admin" ? (
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
        <td className="debug-only">{member.id}</td>
      </tr>
    );
  }
}


export default class Page_Club extends React.Component {
  constructor(props) {
    super(props);
    this.handleClubEditButtonClick = this.handleClubEditButtonClick.bind(this);
  }

  async handleClubEditButtonClick() {
    await Club.editClubPopup(this.props.team);
    Navigation.renderPage();
  }

  render() {
    var memberrows;
    if (Cache.getCurrentTeamData()._state.club_members._initial) {
      memberrows = (
        <tr>
          <td colSpan="4">Laden...</td>
        </tr>
      );
      Club.getClubMembers(this.props.team.id);
    } else {
      memberrows = Object.values(this.props.team.club_members).map((member) => {
        return (
          <ClubMembersTableRow
            key={member.id}
            member={member}
            team={this.props.team}
            loggedinmember={this.props.team.member}
          />
        );
      });
    }

    return (
      <Dashboard.Page
        title="Verein"
        subtitle="Verwalte deinen Verein"
        loading={this.props.team.club === undefined}
      >
        <Dashboard.Column>
          <Dashboard.Tile title="Vereinsinfos">
            <table className="table table-borderless mb-2">
              <tbody>
                <tr key="name">
                  <th>Name:</th>
                  <td>{this.props.team.club.name}</td>
                </tr>
                <tr key="description">
                  <th style={{ width: "1px" }} className="pe-3">
                    Beschreibung:
                  </th>
                  <td style={{ whiteSpace: "pre-line" }}>
                    {this.props.team.club.description}
                  </td>
                </tr>
                <tr key="membercount">
                  <th>Mitglieder:</th>
                  <td>{this.props.team.club.membercount}</td>
                </tr>
                <tr key="id" className="debug-only">
                  <th>ID:</th>
                  <td>{this.props.team.id}</td>
                </tr>
              </tbody>
            </table>
            {this.props.team.member.role === "owner" ? (
              <button
                className="btn btn-outline-dark border-1 me-2"
                onClick={this.handleClubEditButtonClick}
              >
                Verein&nbsp;bearbeiten
              </button>
            ) : null}
          </Dashboard.Tile>

          <Dashboard.Tile title="Vereinsmitglieder">
            <table className="table table-borderless align-middle mb-0">
              <thead>
                <tr>
                  <th>Vor- & Nachname</th>
                  <th>E-Mail-Adresse</th>
                  <th style={{ width: "1px" }}></th>
                  <th style={{ width: "1px" }}></th>
                  <th className="debug-only">ID</th>
                </tr>
              </thead>
              <tbody>{memberrows}</tbody>
            </table>
          </Dashboard.Tile>
        </Dashboard.Column>
      </Dashboard.Page>
    );
  }
}