import React from 'react';

import * as ClubService from '../../../service/clubs.service';
import * as TeamsService from '../../../service/teams.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import {
    useCurrentTeamData,
    usePageNavigator,
} from '../../../utils/navigation/navigationProvider';
import Dashboard from '../../common/dashboard';
import Tables from '../../common/tables';
import IconTooltip from '../../common/tooltips/iconTooltip';
import Tooltip from '../../common/tooltips/tooltip';
import Urlize from '../../common/utils/urlize';
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

    let canBeDeleted = true;
    let cannotBeDeletedTooltipReason = '';
    if (team.club) {
        canBeDeleted = false;
        cannotBeDeletedTooltipReason =
            'Das Team kann nicht gelöscht werden, solange der Vereinsmodus aktiv ist.';
    } else if (team.membercount > 1) {
        canBeDeleted = false;
        cannotBeDeletedTooltipReason =
            'Das Team kann nicht gelöscht werden, solange du nicht das einzige Mitglied bist.';
    }

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
                    <Tables.VerticalDataTable
                        items={[
                            {
                                label: 'Name',
                                value: team.name,
                            },
                            {
                                label: 'Beschreibung',
                                value: <Urlize text={team.description} />,
                                limitWidth: true,
                            },
                            {
                                label: 'Mitglieder',
                                value: team.membercount,
                            },
                            {
                                label: 'ID',
                                value: team.id,
                                isDebugId: true,
                            },
                        ]}
                    >
                        <Tables.ButtonFooter
                            show={team.member!.is_owner}
                            noTopBorder={true}
                        >
                            <button
                                className="btn btn-outline-dark border-1"
                                onClick={handleTeamEditButtonClick}
                            >
                                Team&nbsp;bearbeiten
                            </button>
                            {canBeDeleted ? (
                                <button
                                    className="btn btn-outline-danger border-1"
                                    onClick={handleTeamDeleteButtonClick}
                                >
                                    Team&nbsp;löschen
                                </button>
                            ) : (
                                <Tooltip title={cannotBeDeletedTooltipReason}>
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
                        </Tables.ButtonFooter>
                    </Tables.VerticalDataTable>
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
