import React from 'react';

import { Button } from '@/shadcn/components/ui/button';
import Dashboard from '@/teamized/components/common/dashboard';
import Tables from '@/teamized/components/common/tables';
import Urlize from '@/teamized/components/common/utils/urlize';
import * as ClubService from '@/teamized/service/clubs.service';
import { useAppdataRefresh } from '@/teamized/utils/appdataProvider';
import {
    useCurrentTeamData,
    usePageNavigator,
} from '@/teamized/utils/navigation/navigationProvider';

import ClubGroupsTileContent from './clubGroupsTileContent';
import ClubMemberTileContent from './clubMemberTileContent';

export default function ClubPage() {
    const refreshData = useAppdataRefresh();

    const teamData = useCurrentTeamData();
    const team = teamData?.team;

    const selectPage = usePageNavigator();

    const handleClubEditButtonClick = () => {
        ClubService.editClubPopup(team).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const handleClubDeleteButtonClick = async () => {
        await ClubService.deleteClubPopup(team).then((result) => {
            if (result.isConfirmed) {
                selectPage('team');
                refreshData();
            }
        });
    };

    const club = team.club!;

    return (
        <Dashboard.Page>
            <Dashboard.Column>
                <Dashboard.CustomCard title="Vereinsinfos" wrapInCardContent>
                    <Tables.VerticalDataTable
                        items={[
                            {
                                label: 'Name',
                                value: club.name,
                            },
                            {
                                label: 'Login URL',
                                value: (
                                    <a
                                        target="_blank"
                                        href={club.url}
                                        rel="noreferrer"
                                    >
                                        {club.slug}
                                    </a>
                                ),
                            },
                            {
                                label: 'Beschreibung',
                                value: <Urlize text={club.description} />,
                            },
                            {
                                label: 'Mitglieder',
                                value: club.membercount,
                            },
                            {
                                label: 'ID',
                                value: club.id,
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
                                onClick={handleClubEditButtonClick}
                            >
                                Verein&nbsp;bearbeiten
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleClubDeleteButtonClick}
                            >
                                Verein&nbsp;löschen
                            </Button>
                        </Tables.ButtonFooter>
                    </Tables.VerticalDataTable>
                </Dashboard.CustomCard>

                <Dashboard.CustomCard
                    title="Vereinsmitglieder"
                    wrapInCardContent
                >
                    <ClubMemberTileContent teamData={teamData} />
                </Dashboard.CustomCard>

                <Dashboard.CustomCard title="Vereinsgruppen" wrapInCardContent>
                    <ClubGroupsTileContent teamData={teamData} />
                </Dashboard.CustomCard>
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
