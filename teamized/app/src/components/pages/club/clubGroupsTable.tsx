import React from 'react';

import { ClubGroup } from '../../../interfaces/club/clubGroup';
import { Team } from '../../../interfaces/teams/team';
import * as ClubService from '../../../service/clubs.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import Tables from '../../common/tables';
import ClubGroupsTableRow from './clubGroupsTableRow';

interface Props {
    team: Team;
    clubGroups: ClubGroup[];
    isAdmin: boolean;
}

export default function ClubGroupsTable({ team, clubGroups, isAdmin }: Props) {
    const refreshData = useAppdataRefresh();

    const handleCreateButtonClick = () => {
        ClubService.createClubGroupPopup(team).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    return (
        <Tables.SimpleTable>
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
                    <th className="debug-id">ID</th>
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
            <Tables.ButtonFooter show={isAdmin}>
                <button
                    type="button"
                    className="btn btn-outline-success border-1"
                    onClick={handleCreateButtonClick}
                >
                    Gruppe erstellen
                </button>
            </Tables.ButtonFooter>
        </Tables.SimpleTable>
    );
}
