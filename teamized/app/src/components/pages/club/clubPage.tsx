import React from 'react';
import * as Dashboard from '../../common/dashboard';
import * as Club from '../../../utils/club';
import * as Navigation from '../../../utils/navigation';
import { Team } from '../../../interfaces/teams/team';
import ClubMemberTileContent from './clubMemberTileContent';

interface Props {
    team: Team;
}

export default function ClubPage({ team }: Props) {
    const handleClubEditButtonClick = async () => {
        await Club.editClubPopup(team);
        Navigation.render();
    };

    const handleClubDeleteButtonClick = async () => {
        await Club.deleteClubPopup(team);
        Navigation.selectPage('team');
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
                            <tr key="name">
                                <th>Name:</th>
                                <td>{club.name}</td>
                            </tr>
                            <tr key="url">
                                <th>Login URL:</th>
                                <td>
                                    <a target="_blank" href={club.url}>
                                        {club.slug}
                                    </a>
                                </td>
                            </tr>
                            <tr key="description">
                                <th style={{ width: '1px' }} className="pe-3">
                                    Beschreibung:
                                </th>
                                <td style={{ whiteSpace: 'pre-line' }}>
                                    {club.description}
                                </td>
                            </tr>
                            <tr key="membercount">
                                <th>Mitglieder:</th>
                                <td>{club.membercount}</td>
                            </tr>
                            <tr key="id" className="debug-only">
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
