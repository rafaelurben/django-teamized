'use strict';

/**
 * Team page component (main component at the end of this file)
 */

import React from 'react';

import { successAlert } from '../../utils/alerts.ts';
import * as Cache from '../../utils/cache.js';
import * as Club from '../../utils/club.js';
import * as Teams from '../../utils/teams.js';
import * as Navigation from '../../utils/navigation.js';
import * as Dashboard from '../dashboard.jsx';
import { IconTooltip, Tooltip } from '../tooltips.jsx';

class TeamMembersTableRow extends React.Component {
    constructor(props) {
        super(props);
        this.handlePromoteButtonClick =
            this.handlePromoteButtonClick.bind(this);
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
            Navigation.selectPage('teamlist');
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
                    <a href={'mailto:' + member.user.email}>
                        {member.user.email}
                    </a>
                </td>
                {/* Member role */}
                <td>
                    <span>{member.role_text}</span>
                </td>
                {/* Action: Promote/Demote */}
                {loggedinmember.is_owner ? (
                    !member.is_owner ? (
                        !member.is_admin ? (
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
                    )
                ) : null}
                {/* Action: Leave / remove member */}
                {member.id === loggedinmember.id ? (
                    !loggedinmember.is_owner ? (
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
                ) : loggedinmember.is_owner ||
                  (loggedinmember.is_admin && !member.is_admin) ? (
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

class TeamInvitesTableRow extends React.Component {
    constructor(props) {
        super(props);
        this.inviteurl =
            window.location.href.split('?')[0] +
            '?invite=' +
            this.props.invite.token;
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
        successAlert(
            'Der Token wurde in die Zwischenablage kopiert.',
            'Token kopiert'
        );
    }

    copyURL() {
        navigator.clipboard.writeText(this.inviteurl);
        successAlert(
            'Der Link wurde in die Zwischenablage kopiert.',
            'Link kopiert'
        );
    }

    render() {
        let invite = this.props.invite;

        return (
            <tr>
                {/* Note */}
                <td style={{ whiteSpace: 'pre-line' }}>
                    <span>{invite.note}</span>
                </td>
                {/* Share */}
                <td>
                    <abbr
                        title={invite.token}
                        className="me-1"
                        onClick={this.copyToken}
                    >
                        <i className="fas fa-key"></i>
                    </abbr>
                    <abbr title={this.inviteurl} onClick={this.copyURL}>
                        <i className="fas fa-link"></i>
                    </abbr>
                </td>
                {/* Valid until */}
                <td>
                    <span>
                        {invite.valid_until
                            ? new Date(invite.valid_until).toLocaleString()
                            : '\u221e'}
                    </span>
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

export default class Page_Team extends React.Component {
    constructor(props) {
        super(props);
        this.handleInviteCreateButtonClick =
            this.handleInviteCreateButtonClick.bind(this);
        this.handleTeamEditButtonClick =
            this.handleTeamEditButtonClick.bind(this);
        this.handleTeamDeleteButtonClick =
            this.handleTeamDeleteButtonClick.bind(this);
        this.handleClubCreateButtonClick =
            this.handleClubCreateButtonClick.bind(this);
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
            Navigation.selectPage('teamlist');
        }
    }

    async handleClubCreateButtonClick() {
        let result = await Club.createClubPopup(this.props.team);
        if (result) Navigation.selectPage('club');
    }

    render() {
        var memberrows;
        if (Cache.getCurrentTeamData()._state.members._initial) {
            memberrows = (
                <tr>
                    <td colSpan="4">Laden...</td>
                </tr>
            );
            Teams.getMembers(this.props.team.id);
        } else {
            memberrows = Object.values(this.props.members).map((member) => {
                return (
                    <TeamMembersTableRow
                        key={member.id}
                        member={member}
                        team={this.props.team}
                        loggedinmember={this.props.team.member}
                    />
                );
            });
        }

        var inviterows;
        if (this.props.team.member.is_owner) {
            if (Cache.getCurrentTeamData()._state.invites._initial) {
                inviterows = (
                    <tr>
                        <td colSpan="4">Laden...</td>
                    </tr>
                );
                Teams.getInvites(this.props.team.id);
            } else if (Object.keys(this.props.invites).length == 0) {
                inviterows = (
                    <tr>
                        <td colSpan="4">Keine Einladungen vorhanden</td>
                    </tr>
                );
            } else {
                inviterows = Object.values(this.props.invites).map((invite) => {
                    return (
                        <TeamInvitesTableRow
                            key={invite.id}
                            invite={invite}
                            team={this.props.team}
                        />
                    );
                });
            }
        }

        return (
            <Dashboard.Page
                title="Dein Team"
                subtitle="Infos über dein ausgewähltes Team"
                loading={Cache.getCurrentTeamData()._state.members._initial}
            >
                <Dashboard.Column>
                    <Dashboard.Tile
                        title={
                            this.props.team.club === null ? (
                                'Teaminfos'
                            ) : (
                                <div>
                                    Teaminfos
                                    <div className="badge bg-info ms-2">
                                        Vereinsmodus aktiviert
                                        <IconTooltip
                                            title="In diesem Team sind erweiterte Vereinsfunktionen verfügbar."
                                            className="ms-1"
                                        />
                                    </div>
                                </div>
                            )
                        }
                    >
                        <Dashboard.Table vertical={true}>
                            <tbody>
                                <tr key="name">
                                    <th>Name:</th>
                                    <td>{this.props.team.name}</td>
                                </tr>
                                <tr key="description">
                                    <th
                                        style={{ width: '1px' }}
                                        className="pe-3"
                                    >
                                        Beschreibung:
                                    </th>
                                    <td style={{ whiteSpace: 'pre-line' }}>
                                        {this.props.team.description}
                                    </td>
                                </tr>
                                <tr key="membercount">
                                    <th>Mitglieder:</th>
                                    <td>{this.props.team.membercount}</td>
                                </tr>
                                <tr key="id" className="debug-only">
                                    <th>ID:</th>
                                    <td>{this.props.team.id}</td>
                                </tr>
                            </tbody>

                            <Dashboard.TableButtonFooter
                                show={this.props.team.member.is_owner}
                                notopborder={true}
                            >
                                <button
                                    className="btn btn-outline-dark border-1"
                                    onClick={this.handleTeamEditButtonClick}
                                >
                                    Team&nbsp;bearbeiten
                                </button>
                                {!this.props.team.club ? (
                                    this.props.team.membercount === 1 ? (
                                        <button
                                            className="btn btn-outline-danger border-1"
                                            onClick={
                                                this.handleTeamDeleteButtonClick
                                            }
                                        >
                                            Team&nbsp;löschen
                                        </button>
                                    ) : (
                                        <Tooltip title="Das Team kann nicht gelöscht werden, solange noch Mitglieder vorhanden sind.">
                                            <button
                                                className="btn btn-outline-danger border-1"
                                                disabled
                                            >
                                                Team&nbsp;löschen
                                            </button>
                                        </Tooltip>
                                    )
                                ) : (
                                    <Tooltip title="Das Team kann nicht gelöscht werden, solange der Vereinsmodus aktiv ist.">
                                        <button
                                            className="btn btn-outline-danger border-1"
                                            disabled
                                        >
                                            Team&nbsp;löschen
                                        </button>
                                    </Tooltip>
                                )}
                                {!this.props.team.club ? (
                                    <button
                                        className="btn btn-outline-info border-1"
                                        onClick={
                                            this.handleClubCreateButtonClick
                                        }
                                    >
                                        Vereinsmodus&nbsp;aktivieren
                                    </button>
                                ) : null}
                            </Dashboard.TableButtonFooter>
                        </Dashboard.Table>
                    </Dashboard.Tile>

                    <Dashboard.Tile title="Mitglieder">
                        <Dashboard.Table>
                            <thead>
                                <tr>
                                    <th width="32px" className="text-center">
                                        <IconTooltip title="Das Profilbild wird anhand der E-Mail-Adresse auf gravatar.com abgerufen" />
                                    </th>
                                    <th>Name</th>
                                    <th>Benutzername&nbsp;&amp;&nbsp;E-Mail</th>
                                    <th>Rolle</th>
                                    {this.props.team.member.is_owner ? (
                                        <th style={{ width: '1px' }}></th>
                                    ) : null}
                                    <th style={{ width: '1px' }}></th>
                                    <th className="debug-only">ID</th>
                                </tr>
                            </thead>
                            <tbody>{memberrows}</tbody>
                        </Dashboard.Table>
                    </Dashboard.Tile>

                    {this.props.team.member.is_owner ? (
                        <Dashboard.Tile title="Einladungen">
                            <Dashboard.Table>
                                <thead>
                                    <tr>
                                        <th>Notiz</th>
                                        <th style={{ minWidth: '5.5rem' }}>
                                            Teilen{' '}
                                            <IconTooltip title="Auf Icons klicken, um Token bzw. Link zu kopieren" />
                                        </th>
                                        <th style={{ minWidth: '6rem' }}>
                                            Gültig bis
                                        </th>
                                        <th style={{ minWidth: '10rem' }}>
                                            Verwendungen{' '}
                                            <IconTooltip title="Bereits verwendet / noch verfügbar" />
                                        </th>
                                        <th style={{ width: '1px' }}></th>
                                        <th style={{ width: '1px' }}></th>
                                        <th className="debug-only">ID</th>
                                    </tr>
                                </thead>
                                <tbody>{inviterows}</tbody>

                                <Dashboard.TableButtonFooter>
                                    <button
                                        type="button"
                                        className="btn btn-outline-success border-1"
                                        onClick={
                                            this.handleInviteCreateButtonClick
                                        }
                                    >
                                        Einladung erstellen
                                    </button>
                                </Dashboard.TableButtonFooter>
                            </Dashboard.Table>
                        </Dashboard.Tile>
                    ) : null}
                </Dashboard.Column>
            </Dashboard.Page>
        );
    }
}
