import React from 'react';

import * as Dashboard from '../../common/dashboard';
import WorksessionTableRow from './worksessionTableRow';
import { Worksession } from '../../../interfaces/workingtime/worksession';
import { Team } from '../../../interfaces/teams/team';

interface Props {
    team: Team;
    sessions: Worksession[];
    loading: boolean;
}

export default function WorksessionTable({ sessions, team, loading }: Props) {
    return (
        <Dashboard.Table>
            <thead>
                <tr>
                    <th style={{ minWidth: '13rem' }}>Start &amp; Ende</th>
                    <th style={{ minWidth: '8rem' }}>Dauer</th>
                    <th style={{ minWidth: '15rem' }}>Notiz</th>
                    <th style={{ width: '1px' }}></th>
                    <th style={{ width: '1px' }}></th>
                    <th className="debug-only">ID</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr>
                        <td colSpan={3}>Laden...</td>
                    </tr>
                ) : sessions.length === 0 ? (
                    <tr>
                        <td colSpan={3}>
                            Noch keine Zeiten im ausgewählten Zeitraum erfasst.
                        </td>
                    </tr>
                ) : (
                    sessions.map((session) => (
                        <WorksessionTableRow
                            key={session.id}
                            session={session}
                            team={team}
                        />
                    ))
                )}
            </tbody>
        </Dashboard.Table>
    );
}
