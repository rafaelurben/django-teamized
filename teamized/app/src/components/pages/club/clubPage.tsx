import React from 'react';

import * as ClubService from '../../../service/clubs.service';
import * as NavigationService from '../../../service/navigation.service';
import {
    useCurrentTeamData,
    usePageNavigator,
} from '../../../utils/navigation/navigationProvider';
import Dashboard from '../../common/dashboard';
import ClubMemberTileContent from './clubMemberTileContent';

export default function ClubPage() {
    const teamData = useCurrentTeamData();
    const team = teamData?.team;

    const selectPage = usePageNavigator();

    const handleClubEditButtonClick = async () => {
        await ClubService.editClubPopup(team);
        NavigationService.render();
    };

    const handleClubDeleteButtonClick = async () => {
        await ClubService.deleteClubPopup(team).then((result) => {
            if (result.isConfirmed) {
                selectPage('team');
            }
        });
    };

    const club = team.club!;
    const isAdmin = team.member!.is_admin;
    const isOwner = team.member!.is_owner;

    return (
        <Dashboard.Page
            title="Verein"
            subtitle="Verwalte deinen Verein"
            loading={club === undefined}
        >
            <Dashboard.Column>
                <Dashboard.Tile title="Vereinsinfos">
                    <Dashboard.Table vertical={true}>
                        <tbody>
                            <tr>
                                <th>Name:</th>
                                <td>{club.name}</td>
                            </tr>
                            <tr>
                                <th>Login URL:</th>
                                <td>
                                    <a
                                        target="_blank"
                                        href={club.url}
                                        rel="noreferrer"
                                    >
                                        {club.slug}
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <th style={{ width: '1px' }} className="pe-3">
                                    Beschreibung:
                                </th>
                                <td style={{ whiteSpace: 'pre-line' }}>
                                    {club.description}
                                </td>
                            </tr>
                            <tr>
                                <th>Mitglieder:</th>
                                <td>{club.membercount}</td>
                            </tr>
                            <tr className="debug-only">
                                <th>ID:</th>
                                <td>{club.id}</td>
                            </tr>
                        </tbody>
                        <Dashboard.TableButtonFooter
                            show={isOwner}
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
                        </Dashboard.TableButtonFooter>
                    </Dashboard.Table>
                </Dashboard.Tile>

                <Dashboard.Tile title="Vereinsmitglieder">
                    <ClubMemberTileContent
                        team={team}
                        isAdmin={isAdmin}
                        isOwner={isOwner}
                    />
                </Dashboard.Tile>
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
