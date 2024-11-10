import React from 'react';

import { ClubGroup } from '../../../interfaces/club/clubGroup';
import { Team } from '../../../interfaces/teams/team';
import * as ClubService from '../../../service/clubs.service';
import * as NavigationService from '../../../service/navigation.service';
import Dashboard from '../../common/dashboard';
import ClubGroupsTableRow from './clubGroupsTableRow';

interface Props {
    team: Team;
    clubGroups: ClubGroup[];
    isAdmin: boolean;
}

export default function ClubGroupsTable({ team, clubGroups, isAdmin }: Props) {
    const handleCreateButtonClick = async () => {
        await ClubService.createClubGroupPopup(team);
        NavigationService.renderPage();
    };

    return (
        <Dashboard.Table>
            <thead>
                <tr>
                    <th>Gruppenname</th>
                    <th>Beschreibung</th>
                    {isAdmin && (
                        <>
                            <th style={{ width: '1px' }}></th>
                            <th style={{ width: '1px' }}></th>
                            <th style={{ width: '1px' }}></th>
                        </>
                    )}
                    <th className="debug-only">ID</th>
                </tr>
            </thead>
            <tbody>
                {clubGroups.map((clubGroup) => (
                    <ClubGroupsTableRow
                        key={clubGroup.id}
                        group={clubGroup}
                        team={team}
                        isAdmin={isAdmin}
                    />
                ))}
            </tbody>
            <Dashboard.TableButtonFooter show={isAdmin}>
                <button
                    type="button"
                    className="btn btn-outline-success border-1"
                    onClick={handleCreateButtonClick}
                >
                    Gruppe erstellen
                </button>
            </Dashboard.TableButtonFooter>
        </Dashboard.Table>
    );
}
