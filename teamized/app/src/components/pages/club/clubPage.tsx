import React from 'react';

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
        <Dashboard.Page
            title="Verein"
            subtitle="Verwalte deinen Verein"
            loading={club === undefined}
        >
            <Dashboard.Column>
                <Dashboard.Tile title="Vereinsinfos">
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
                            <button
                                className="btn btn-outline-dark border-1 me-2"
                                onClick={handleClubEditButtonClick}
                            >
                                Verein&nbsp;bearbeiten
                            </button>
                            <button
                                className="btn btn-outline-danger border-1"
                                onClick={handleClubDeleteButtonClick}
                            >
                                Verein&nbsp;löschen
                            </button>
                        </Tables.ButtonFooter>
                    </Tables.VerticalDataTable>
                </Dashboard.Tile>

                <Dashboard.Tile title="Vereinsmitglieder">
                    <ClubMemberTileContent teamData={teamData} />
                </Dashboard.Tile>
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
