'use strict';

/**
 * Teamlist page component (main component at the end of this file)
 */

import React from 'react';

import { waitingAlert } from '../../utils/alerts.ts';
import * as Teams from '../../utils/teams';
import * as Navigation from '../../utils/navigation.tsx';
import * as Dashboard from '../dashboard.jsx';
import { IconTooltip } from '../tooltips.jsx';

class TeamTableRow extends React.Component {
    constructor(props) {
        super(props);
        this.handleSwitchToButtonClick =
            this.handleSwitchToButtonClick.bind(this);
        this.handleManageButtonClick = this.handleManageButtonClick.bind(this);
        this.handleLeaveButtonClick = this.handleLeaveButtonClick.bind(this);
        this.handleDeleteButtonClick = this.handleDeleteButtonClick.bind(this);
    }

    handleSwitchToButtonClick() {
        Teams.switchTeam(this.props.team.id);
    }

    handleManageButtonClick() {
        Teams.switchTeam(this.props.team.id);
        Navigation.selectPage('team');
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
                {/* Member count */}
                <td className="align-middle text-center">
                    <span>{this.props.team.membercount}</span>
                </td>
                {/* Name and description */}
                <td className="py-2">
                    <span>{this.props.team.name}</span>
                    <br className="d-none d-lg-inline-block" />
                    <i className="d-none d-lg-inline-block">
                        {this.props.team.description}
                    </i>
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
                {this.props.team.member.is_admin ? (
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
                {!this.props.team.member.is_owner ? (
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
                <td className="debug-only">{this.props.team.id}</td>
            </tr>
        );
    }
}

export default class Page_TeamList extends React.Component {
    constructor(props) {
        super(props);
    }

    joinTeam() {
        let tokeninput = document.getElementById('invite-token');
        let token = tokeninput.value;

        waitingAlert('Einladung wird geprüft...');
        Teams.checkInvitePopup(token);
    }

    render() {
        let rows = this.props.teams.map((team) => {
            return (
                <TeamTableRow
                    key={team.id}
                    team={team}
                    selectedTeamId={this.props.selectedTeamId}
                />
            );
        });

        const prefilledInviteToken = new URL(
            window.location.href
        ).searchParams.get('invite', '');

        return (
            <Dashboard.Page
                title="Deine Teams"
                subtitle="Verwalte deine Teams, erstelle ein neues oder trete einem bei"
            >
                <Dashboard.Column>
                    <Dashboard.Tile title="Teamübersicht">
                        <Dashboard.Table>
                            <thead>
                                <tr>
                                    <th
                                        className="text-center"
                                        style={{ width: '1px' }}
                                    >
                                        <IconTooltip
                                            icon="fa-solid fa-fw fa-users"
                                            title="Anzahl Mitglieder"
                                        />
                                    </th>
                                    <th>
                                        <span>Name </span>
                                        <span className="d-none d-lg-inline-block">
                                            &amp; Beschreibung
                                        </span>
                                    </th>
                                    <th>Deine Rolle</th>
                                    <th style={{ width: '1px' }}></th>
                                    <th style={{ width: '1px' }}></th>
                                    <th style={{ width: '1px' }}></th>
                                    <th className="debug-only">ID</th>
                                </tr>
                            </thead>
                            <tbody>{rows}</tbody>
                        </Dashboard.Table>
                    </Dashboard.Tile>

                    <Dashboard.Tile title="Team erstellen oder beitreten">
                        <p className="mx-1">
                            Klicke auf "Team erstellen", um ein neues Team zu
                            erstellen oder gib einen Einladungstoken ein und
                            klicke auf "Team beitreten", um einem Team
                            beizutreten.
                        </p>
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
                    </Dashboard.Tile>
                </Dashboard.Column>
            </Dashboard.Page>
        );
    }
}
