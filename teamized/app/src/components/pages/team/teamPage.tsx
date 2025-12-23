import React from 'react';

import { Badge } from '@/shadcn/components/ui/badge';
import { Button } from '@/shadcn/components/ui/button';
import Dashboard from '@/teamized/components/common/dashboard';
import Tables from '@/teamized/components/common/tables';
import CustomTooltip from '@/teamized/components/common/tooltips/customTooltip';
import IconTooltip from '@/teamized/components/common/tooltips/iconTooltip';
import Urlize from '@/teamized/components/common/utils/urlize';
import * as ClubService from '@/teamized/service/clubs.service';
import * as TeamsService from '@/teamized/service/teams.service';
import { useAppdataRefresh } from '@/teamized/utils/appdataProvider';
import {
    useCurrentTeamData,
    usePageNavigator,
} from '@/teamized/utils/navigation/navigationProvider';

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
        <Dashboard.Page>
            <Dashboard.Column>
                <Dashboard.CustomCard
                    title={
                        team.club === null ? (
                            'Teaminfos'
                        ) : (
                            <div className="tw:flex tw:items-center tw:gap-3">
                                Teaminfos
                                <Badge variant="info">
                                    Vereinsmodus aktiviert
                                    <IconTooltip title="In diesem Team sind erweiterte Vereinsfunktionen verfügbar." />
                                </Badge>
                            </div>
                        )
                    }
                    wrapInCardContent
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
                            <Button
                                variant="outline"
                                onClick={handleTeamEditButtonClick}
                            >
                                Team&nbsp;bearbeiten
                            </Button>
                            {canBeDeleted ? (
                                <Button
                                    variant="destructive"
                                    onClick={handleTeamDeleteButtonClick}
                                >
                                    Team&nbsp;löschen
                                </Button>
                            ) : (
                                <CustomTooltip
                                    title={cannotBeDeletedTooltipReason}
                                >
                                    <Button variant="destructive" disabled>
                                        Team&nbsp;löschen
                                    </Button>
                                </CustomTooltip>
                            )}
                            {!team.club && (
                                <Button
                                    variant="info"
                                    onClick={handleClubCreateButtonClick}
                                >
                                    Vereinsmodus&nbsp;aktivieren
                                </Button>
                            )}
                        </Tables.ButtonFooter>
                    </Tables.VerticalDataTable>
                </Dashboard.CustomCard>

                <Dashboard.CustomCard title="Mitglieder" wrapInCardContent>
                    <TeamMemberTable teamData={teamData} />
                </Dashboard.CustomCard>

                {team.member!.is_owner && (
                    <Dashboard.CustomCard title="Einladungen" wrapInCardContent>
                        <TeamInviteTable teamData={teamData} />
                    </Dashboard.CustomCard>
                )}
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
