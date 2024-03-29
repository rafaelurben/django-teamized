"use strict";

/**
 * Club page component
 */

import React from "react";

import {getDateString, getAge} from "../../utils/datetime.js";
import * as Dashboard from "../dashboard.jsx";
import * as Cache from "../../utils/cache.js";
import * as Club from "../../utils/club.js";
import * as Navigation from "../../utils/navigation.js";
import {IconTooltip} from "../tooltips.jsx";


class ClubMembersTableRow extends React.Component {
    constructor(props) {
        super(props);
        this.handleRemoveButtonClick = this.handleRemoveButtonClick.bind(this);
        this.handleEditButtonClick = this.handleEditButtonClick.bind(this);
        this.handlePortfolioEditButtonClick = this.handlePortfolioEditButtonClick.bind(this);
        this.handleGroupEditButtonClick = this.handleGroupEditButtonClick.bind(this);
        this.handleCreateMagicLinkButtonClick = this.handleCreateMagicLinkButtonClick.bind(this);
    }

    async handleRemoveButtonClick() {
        await Club.deleteClubMemberPopup(this.props.team, this.props.member);
        Navigation.renderPage();
    }

    async handleEditButtonClick() {
        await Club.editClubMemberPopup(this.props.team, this.props.member);
        Navigation.renderPage();
    }

    async handlePortfolioEditButtonClick() {
        await Club.editClubMemberPortfolioPopup(this.props.team, this.props.member);
    }

    async handleGroupEditButtonClick() {
        await Club.updateClubMemberGroupsPopup(this.props.team, this.props.member);
        Navigation.renderPage();
    }

    async handleCreateMagicLinkButtonClick() {
        await Club.createClubMemberMagicLink(this.props.team.id, this.props.member.id);
    }

    render() {
        let member = this.props.member;
        let loggedinmember = this.props.loggedinmember;

        return (
            <tr>
                {/* Name */}
                <td>
                    <span>{member.first_name}</span>
                </td>
                <td>
                    <span>{member.last_name}</span>
                </td>
                <td>
                    {member.birth_date === null ? null : (
                        <span>
              {getDateString(new Date(member.birth_date))} (
                            {getAge(member.birth_date)})
            </span>
                    )}
                </td>
                {/* Email */}
                <td>
                    <a href={"mailto:" + member.email}>{member.email}</a>
                </td>
                {/* Action: Create magic link */}
                {loggedinmember.is_owner ? (
                    <td>
                        <a
                            className="btn btn-outline-primary border-1"
                            onClick={this.handleCreateMagicLinkButtonClick}
                            title="Magischer Link erstellen"
                        >
                            <i className="fas fa-fw fa-key"></i>
                        </a>
                    </td>
                ) : (
                    null
                )}
                {/* Action: Edit */}
                {loggedinmember.is_admin ? (
                    <td>
                        <a
                            className="btn btn-outline-dark border-1"
                            onClick={this.handleEditButtonClick}
                            title="Mitglied bearbeiten"
                        >
                            <i className="fas fa-fw fa-user-pen"></i>
                        </a>
                    </td>
                ) : (
                    null
                )}
                {/* Action: Portfolio Edit */}
                {loggedinmember.is_admin ? (
                    <td>
                        <a
                            className="btn btn-outline-dark border-1"
                            onClick={this.handlePortfolioEditButtonClick}
                            title="Portfolio bearbeiten"
                        >
                            <i className="fas fa-fw fa-file-pen"></i>
                        </a>
                    </td>
                ) : (
                    null
                )}
                {/* Action: Manage groups */}
                {loggedinmember.is_admin ? (
                    <td>
                        <a
                            className="btn btn-outline-dark border-1"
                            onClick={this.handleGroupEditButtonClick}
                            title="Gruppen anpassen"
                        >
                            <i className="fas fa-fw fa-users-rectangle"></i>
                        </a>
                    </td>
                ) : (
                    null
                )}
                {/* Action: Delete */}
                {loggedinmember.is_admin ? (
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
                    null
                )}
                {/* ID */}
                <td className="debug-only">{member.id}</td>
            </tr>
        );
    }
}

class ClubMembersTable extends React.Component {
    constructor(props) {
        super(props);
        this.handleCreateButtonClick = this.handleCreateButtonClick.bind(this);
    }

    async handleCreateButtonClick() {
        await Club.createClubMemberPopup(this.props.team);
        Navigation.renderPage();
    }

    render() {
        let memberrows = this.props.members.map((member) => {
            return (
                <ClubMembersTableRow
                    key={member.id}
                    member={member}
                    team={this.props.team}
                    loggedinmember={this.props.team.member}
                />
            );
        });
        let loggedinmember = this.props.team.member;

        return (
            <Dashboard.Table>
                <thead>
                <tr>
                    <th>Vorname</th>
                    <th>Nachname</th>
                    <th>Geburtsdatum</th>
                    <th style={{minWidth: "15rem"}}>
                        E-Mail-Adresse{" "}
                        <IconTooltip
                            title="Eine E-Mail-Adresse kann nicht mehrfach verwendet werden."
                            icon="fas fa-circle-exclamation text-warning"
                        />
                    </th>
                    {loggedinmember.is_owner ? (
                        <th style={{width: "1px"}}></th>
                    ) : null}
                    {loggedinmember.is_admin ? (
                        <th style={{width: "1px"}}></th>
                    ) : null}
                    {loggedinmember.is_admin ? (
                        <th style={{width: "1px"}}></th>
                    ) : null}
                    {loggedinmember.is_admin ? (
                        <th style={{width: "1px"}}></th>
                    ) : null}
                    {loggedinmember.is_admin ? (
                        <th style={{width: "1px"}}></th>
                    ) : null}
                    <th className="debug-only">ID</th>
                </tr>
                </thead>
                <tbody>{memberrows}</tbody>

                <Dashboard.TableButtonFooter show={loggedinmember.is_admin}>
                    <button
                        type="button"
                        className="btn btn-outline-success border-1"
                        onClick={this.handleCreateButtonClick}
                    >
                        Mitglied erstellen
                    </button>
                </Dashboard.TableButtonFooter>
            </Dashboard.Table>
        );
    }
}


class ClubGroupsTableRow extends React.Component {
    constructor(props) {
        super(props);
        this.handleRemoveButtonClick = this.handleRemoveButtonClick.bind(this);
        this.handleEditButtonClick = this.handleEditButtonClick.bind(this);
        this.handleSharePortfolioButtonClick = this.handleSharePortfolioButtonClick.bind(this);
    }

    async handleRemoveButtonClick() {
        await Club.deleteClubGroupPopup(this.props.team, this.props.group);
        Navigation.renderPage();
    }

    async handleEditButtonClick() {
        await Club.editClubGroupPopup(this.props.team, this.props.group);
        Navigation.renderPage();
    }

    async handleSharePortfolioButtonClick() {
        Swal.fire({
            title: "Mitgliederportfolios exportieren",
            html: `
                Über folgende URL können die Mitgliederportfolios der Gruppe "${this.props.group.name}"
                im JSON-Format abgerufen werden:
                <input class="swal2-input" type="text" readonly value="${this.props.group.shared_url}">
              `,
            showCancelButton: true,
            showConfirmButton: false,
            cancelButtonText: "Schliessen",
        });
    }

    render() {
        let group = this.props.group;
        let loggedinmember = this.props.loggedinmember;

        return (
            <tr>
                {/* Name */}
                <td>
                    <span>{group.name}</span>
                </td>
                {/* Beschreibung */}
                <td>
                    <span>{group.description}</span>
                </td>
                {/* Action: Share group portfolios */}
                {loggedinmember.is_admin ? (
                    <td>
                        <a
                            className="btn btn-outline-primary border-1"
                            onClick={this.handleSharePortfolioButtonClick}
                            title="Mitgliederportfolios teilen (API)"
                        >
                            <i className="fas fa-fw fa-share"></i>
                        </a>
                    </td>
                ) : null}
                {/* Action: Edit */}
                {loggedinmember.is_admin ? (
                    <td>
                        <a
                            className="btn btn-outline-dark border-1"
                            onClick={this.handleEditButtonClick}
                            title="Gruppe bearbeiten"
                        >
                            <i className="fas fa-fw fa-pen-to-square"></i>
                        </a>
                    </td>
                ) : null}
                {/* Action: Delete */}
                {loggedinmember.is_admin ? (
                    <td>
                        <a
                            className="btn btn-outline-danger border-1"
                            onClick={this.handleRemoveButtonClick}
                            title="Gruppe löschen"
                        >
                            <i className="fas fa-fw fa-trash"></i>
                        </a>
                    </td>
                ) : null}
                {/* ID */}
                <td className="debug-only">{group.id}</td>
            </tr>
        );
    }
}

class ClubGroupsTable extends React.Component {
    constructor(props) {
        super(props);
        this.handleCreateButtonClick = this.handleCreateButtonClick.bind(this);
    }

    async handleCreateButtonClick() {
        await Club.createClubGroupPopup(this.props.team);
        Navigation.renderPage();
    }

    render() {
        let loggedinmember = this.props.team.member;
        let grouprows = this.props.groups.map((group) => {
            return (
                <ClubGroupsTableRow
                    key={group.id}
                    group={group}
                    team={this.props.team}
                    loggedinmember={loggedinmember}
                />
            );
        });

        return (
            <Dashboard.Table>
                <thead>
                <tr>
                    <th>Gruppenname</th>
                    <th>Beschreibung</th>
                    {this.props.team.member.is_admin ? (
                        <th style={{width: "1px"}}></th>
                    ) : null}
                    {this.props.team.member.is_admin ? (
                        <th style={{width: "1px"}}></th>
                    ) : null}
                    {this.props.team.member.is_admin ? (
                        <th style={{width: "1px"}}></th>
                    ) : null}
                    <th className="debug-only">ID</th>
                </tr>
                </thead>
                <tbody>{grouprows}</tbody>
                <Dashboard.TableButtonFooter show={loggedinmember.is_admin}>
                    <button
                        type="button"
                        className="btn btn-outline-success border-1"
                        onClick={this.handleCreateButtonClick}
                    >
                        Gruppe erstellen
                    </button>
                </Dashboard.TableButtonFooter>
            </Dashboard.Table>
        );
    }
}


export default class Page_Club extends React.Component {
    constructor(props) {
        super(props);
        this.state = {selectedTab: "all"};

        this.selectTab = this.selectTab.bind(this);
        this.handleClubEditButtonClick = this.handleClubEditButtonClick.bind(this);
        this.handleClubDeleteButtonClick = this.handleClubDeleteButtonClick.bind(this);
    }

    selectTab = (tab) => (e) => {
        this.setState({selectedTab: tab});
    };

    async handleClubEditButtonClick() {
        await Club.editClubPopup(this.props.team);
        Navigation.render();
    }

    async handleClubDeleteButtonClick() {
        await Club.deleteClubPopup(this.props.team);
        Navigation.selectPage("team");
    }

    render() {
        let teamdata = Cache.getCurrentTeamData();
        var membertilecontent;

        if (
            teamdata._state.club_members._initial ||
            teamdata._state.club_groups._initial
        ) {
            if (teamdata._state.club_members._initial) Club.getClubMembers(this.props.team.id);
            if (teamdata._state.club_groups._initial) Club.getClubGroups(this.props.team.id);
            membertilecontent = <p className="ms-2">Wird geladen...</p>;
        } else {
            let nav = (
                <div key="nav" className="m-2 border-0">
                    <ul key="ul" className="nav nav-tabs">
                        <li key="all" className="nav-item">
                            <button
                                className={this.state.selectedTab === "all" ? "nav-link active" : "nav-link"}
                                onClick={this.selectTab('all')}
                            >
                                Alle ({Object.keys(teamdata.club_members).length})
                            </button>
                        </li>
                        {Object.values(teamdata.club_groups).map((group) => {
                            return (
                                <li key={group.id} className="nav-item">
                                    <button
                                        className={this.state.selectedTab === group.id ? "nav-link active" : "nav-link"}
                                        onClick={this.selectTab(group.id)}>
                                        {group.name} ({group.memberids.length})
                                        {group.description ? (
                                            <IconTooltip className="ms-1" title={group.description}/>
                                        ) : null}
                                    </button>
                                </li>
                            )
                        })}
                        <li key="edit" className="nav-item ms-auto">
                            <button
                                className={this.state.selectedTab === "edit" ? "nav-link active" : "nav-link"}
                                onClick={this.selectTab("edit")}
                            >
                                <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                        </li>
                    </ul>
                </div>
            );

            switch (this.state.selectedTab) {
                case "all": // all members
                    membertilecontent = [
                        nav,
                        <ClubMembersTable
                            key="table"
                            team={this.props.team}
                            members={Object.values(teamdata.club_members)}
                        />
                    ];
                    break;
                case "edit": // edit groups
                    membertilecontent = [
                        nav,
                        <ClubGroupsTable
                            key="table"
                            team={this.props.team}
                            groups={Object.values(teamdata.club_groups)}
                        />,
                    ];
                    break;
                default: // filtered members by group
                    let group = teamdata.club_groups[this.state.selectedTab];
                    let groupmembers = Object.values(teamdata.club_members).filter((member) => {
                        return group.memberids.includes(member.id);
                    });

                    membertilecontent = [
                        nav,
                        <ClubMembersTable
                            key="table"
                            team={this.props.team}
                            members={groupmembers}
                        />,
                    ];
                    break;
            }
        }

        return (
            <Dashboard.Page
                title="Verein"
                subtitle="Verwalte deinen Verein"
                loading={this.props.team.club === undefined}
            >
                <Dashboard.Column>
                    <Dashboard.Tile title="Vereinsinfos">
                        <Dashboard.Table vertical={true}>
                            <tbody>
                            <tr key="name">
                                <th>Name:</th>
                                <td>{this.props.team.club.name}</td>
                            </tr>
                            <tr key="url">
                                <th>Login URL:</th>
                                <td>
                                    <a target="_blank" href={this.props.team.club.url}>
                                        {this.props.team.club.slug}
                                    </a>
                                </td>
                            </tr>
                            <tr key="description">
                                <th style={{width: "1px"}} className="pe-3">
                                    Beschreibung:
                                </th>
                                <td style={{whiteSpace: "pre-line"}}>
                                    {this.props.team.club.description}
                                </td>
                            </tr>
                            <tr key="membercount">
                                <th>Mitglieder:</th>
                                <td>{this.props.team.club.membercount}</td>
                            </tr>
                            <tr key="id" className="debug-only">
                                <th>ID:</th>
                                <td>{this.props.team.club.id}</td>
                            </tr>
                            </tbody>
                            <Dashboard.TableButtonFooter
                                show={this.props.team.member.is_owner}
                                notopborder={true}
                            >
                                <button
                                    className="btn btn-outline-dark border-1 me-2"
                                    onClick={this.handleClubEditButtonClick}
                                >
                                    Verein&nbsp;bearbeiten
                                </button>
                                <button
                                    className="btn btn-outline-danger border-1"
                                    onClick={this.handleClubDeleteButtonClick}
                                >
                                    Verein&nbsp;löschen
                                </button>
                            </Dashboard.TableButtonFooter>
                        </Dashboard.Table>
                    </Dashboard.Tile>

                    <Dashboard.Tile title="Vereinsmitglieder">
                        {membertilecontent}
                    </Dashboard.Tile>
                </Dashboard.Column>
            </Dashboard.Page>
        );
    }
}
