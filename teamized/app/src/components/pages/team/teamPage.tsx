import React from 'react';

import * as ClubService from '../../../service/clubs.service';
import * as TeamsService from '../../../service/teams.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import {
    useCurrentTeamData,
    usePageNavigator,
} from '../../../utils/navigation/navigationProvider';
import Dashboard from '../../common/dashboard';
import IconTooltip from '../../common/tooltips/iconTooltip';
import Tooltip from '../../common/tooltips/tooltip';
import TeamInviteTable from './teamInviteTable';
import TeamMemberTable from './teamMemberTable';

export default function TeamPage() {
    const refreshData = useAppdataRefresh();

    const teamData = useCurrentTeamData();
    const team = teamData?.team;

    const selectPage = usePageNavigator();

    const handleTeamEditButtonClick = () => {
        TeamsService.editTeamPopup(team).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const handleTeamDeleteButtonClick = async () => {
        await TeamsService.deleteTeamPopup(team).then((result) => {
            if (result.isConfirmed) {
                selectPage('teamlist');
                refreshData();
            }
        });
    };

    const handleClubCreateButtonClick = () => {
        ClubService.createClubPopup(team).then((result) => {
            if (result.isConfirmed) {
                selectPage('club');
                refreshData();
            }
        });
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
                            <tr>
                                <th>Name:</th>
                                <td>{team.name}</td>
                            </tr>
                            <tr>
                                <th style={{ width: '1px' }} className="pe-3">
                                    Beschreibung:
                                </th>
                                <td style={{ whiteSpace: 'pre-line' }}>
                                    {team.description}
                                </td>
                            </tr>
                            <tr>
                                <th>Mitglieder:</th>
                                <td>{team.membercount}</td>
                            </tr>
                            <tr className="debug-only">
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
                    <TeamMemberTable teamData={teamData} />
                </Dashboard.Tile>

                {team.member!.is_owner && (
                    <Dashboard.Tile title="Einladungen">
                        <TeamInviteTable teamData={teamData} />
                    </Dashboard.Tile>
                )}
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
