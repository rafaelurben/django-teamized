import React from 'react';

import { ID } from '../../../interfaces/common';
import { Team } from '../../../interfaces/teams/team';
import Tables from '../../common/tables';
import IconTooltip from '../../common/tooltips/iconTooltip';
import TeamTableRow from './teamTableRow';

interface Props {
    teams: Team[];
    selectedTeamId: ID;
}

export default function TeamTable({ teams, selectedTeamId }: Props) {
    return (
        <Tables.SimpleTable>
            <thead>
                <tr>
                    <th className="text-center" style={{ width: '1px' }}>
                        <IconTooltip
                            icon="fa-solid fa-users"
                            title="Anzahl Mitglieder"
                        />
                    </th>
                    <th>
                        <span>Name </span>
                        <span className="d-none d-lg-inline-block">
                            &amp; Beschreibung
                        </span>
                    </th>
                    <th>Deine Rolle</th>
                    <th style={{ width: '1px' }}></th>
                    <th style={{ width: '1px' }}></th>
                    <th style={{ width: '1px' }}></th>
                    <th className="debug-id">ID</th>
                </tr>
            </thead>
            <tbody>
                {teams.map((team) => (
                    <TeamTableRow
                        key={team.id}
                        team={team}
                        isSelected={team.id !== selectedTeamId}
                    />
                ))}
            </tbody>
        </Tables.SimpleTable>
    );
}
