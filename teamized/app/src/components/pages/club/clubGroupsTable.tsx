import React from 'react';

import * as Club from '../../../utils/club';
import * as Navigation from '../../../utils/navigation';
import ClubGroupsTableRow from './clubGroupsTableRow';
import * as Dashboard from '../../common/dashboard';
import { Team } from '../../../interfaces/teams/team';
import { ClubGroup } from '../../../interfaces/club/clubGroup';

interface Props {
    team: Team;
    clubGroups: ClubGroup[];
    isAdmin: boolean;
}

export default function ClubGroupsTable({ team, clubGroups, isAdmin }: Props) {
    const handleCreateButtonClick = async () => {
        await Club.createClubGroupPopup(team);
        Navigation.renderPage();
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
