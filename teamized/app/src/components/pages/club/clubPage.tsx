import React from 'react';

import { Button } from '@/shadcn/components/ui/button';
import { CardContent } from '@/shadcn/components/ui/card';
import ClubGroupsTileContent from '@/teamized/components/pages/club/clubGroupsTileContent';

import * as ClubService from '../../../service/clubs.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import {
    useCurrentTeamData,
    usePageNavigator,
} from '../../../utils/navigation/navigationProvider';
import Dashboard from '../../common/dashboard';
import Tables from '../../common/tables';
import Urlize from '../../common/utils/urlize';
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
        <Dashboard.Page loading={club === undefined}>
            <Dashboard.Column>
                <Dashboard.CustomCard title="Vereinsinfos">
                    <CardContent>
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
                                    limitWidth: true,
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
                    </CardContent>
                </Dashboard.CustomCard>

                <Dashboard.CustomCard title="Vereinsmitglieder">
                    <CardContent>
                        <ClubMemberTileContent teamData={teamData} />
                    </CardContent>
                </Dashboard.CustomCard>

                <Dashboard.CustomCard title="Vereinsgruppen">
                    <CardContent>
                        <ClubGroupsTileContent teamData={teamData} />
                    </CardContent>
                </Dashboard.CustomCard>
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
