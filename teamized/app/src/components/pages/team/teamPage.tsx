import React from 'react';

import * as Club from '../../../utils/club';
import * as Teams from '../../../utils/teams';
import * as Navigation from '../../../utils/navigation';
import * as Dashboard from '../../common/dashboard';
import { IconTooltip } from '../../common/tooltips/iconTooltip';
import { Tooltip } from '../../common/tooltips/tooltip';
import { Team } from '../../../interfaces/teams/team';
import TeamMemberTable from './teamMemberTable';
import TeamInviteTable from './teamInviteTable';

interface Props {
    team: Team;
}

export default function TeamPage({ team }: Props) {
    const handleTeamEditButtonClick = async () => {
        await Teams.editTeamPopup(team);
        Navigation.renderPage();
    };

    const handleTeamDeleteButtonClick = async () => {
        await Teams.deleteTeamPopup(team);
        Navigation.selectPage('teamlist');
    };

    const handleClubCreateButtonClick = async () => {
        let result = await Club.createClubPopup(team);
        if (result) Navigation.selectPage('club');
    };

    return (
        <Dashboard.Page
            title="Dein Team"
            subtitle="Infos über dein ausgewähltes Team"
        >
            <Dashboard.Column>
                <Dashboard.Tile
                    title={
                        team.club === null ? (
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
                                <td>{team.name}</td>
                            </tr>
                            <tr key="description">
                                <th style={{ width: '1px' }} className="pe-3">
                                    Beschreibung:
                                </th>
                                <td style={{ whiteSpace: 'pre-line' }}>
                                    {team.description}
                                </td>
                            </tr>
                            <tr key="membercount">
                                <th>Mitglieder:</th>
                                <td>{team.membercount}</td>
                            </tr>
                            <tr key="id" className="debug-only">
                                <th>ID:</th>
                                <td>{team.id}</td>
                            </tr>
                        </tbody>

                        <Dashboard.TableButtonFooter
                            show={team.member!.is_owner}
                            noTopBorder={true}
                        >
                            <button
                                className="btn btn-outline-dark border-1"
                                onClick={handleTeamEditButtonClick}
                            >
                                Team&nbsp;bearbeiten
                            </button>
                            {!team.club ? (
                                team.membercount === 1 ? (
                                    <button
                                        className="btn btn-outline-danger border-1"
                                        onClick={handleTeamDeleteButtonClick}
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
                            {!team.club && (
                                <button
                                    className="btn btn-outline-info border-1"
                                    onClick={handleClubCreateButtonClick}
                                >
                                    Vereinsmodus&nbsp;aktivieren
                                </button>
                            )}
                        </Dashboard.TableButtonFooter>
                    </Dashboard.Table>
                </Dashboard.Tile>

                <Dashboard.Tile title="Mitglieder">
                    <TeamMemberTable
                        team={team}
                        loggedInMember={team.member!}
                    />
                </Dashboard.Tile>

                {team.member!.is_owner && (
                    <Dashboard.Tile title="Einladungen">
                        <TeamInviteTable team={team} />
                    </Dashboard.Tile>
                )}
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
