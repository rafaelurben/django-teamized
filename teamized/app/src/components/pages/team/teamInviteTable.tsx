import React, { useEffect } from 'react';

import { TeamCache } from '../../../interfaces/cache/teamCache';
import * as TeamsService from '../../../service/teams.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import Dashboard from '../../common/dashboard';
import IconTooltip from '../../common/tooltips/iconTooltip';
import TeamInviteTableRow from './teamInviteTableRow';

interface Props {
    teamData: TeamCache;
}

export default function TeamInviteTable({ teamData }: Props) {
    const refreshData = useAppdataRefresh();

    const team = teamData?.team;

    const invites = Object.values(teamData.invites);
    const loading = teamData._state.invites._initial;

    useEffect(() => {
        if (loading) {
            TeamsService.getInvites(team.id).then(refreshData);
        }
    });

    const handleInviteCreateButtonClick = () => {
        TeamsService.createInvitePopup(team).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    return (
        <Dashboard.Table>
            <thead>
                <tr>
                    <th>Notiz</th>
                    <th style={{ minWidth: '5.5rem' }}>
                        Teilen{' '}
                        <IconTooltip title="Auf Icons klicken, um Token bzw. Link zu kopieren" />
                    </th>
                    <th style={{ minWidth: '6rem' }}>Gültig bis</th>
                    <th style={{ minWidth: '10rem' }}>
                        Verwendungen{' '}
                        <IconTooltip title="Bereits verwendet / noch verfügbar" />
                    </th>
                    <th style={{ width: '1px' }}></th>
                    <th style={{ width: '1px' }}></th>
                    <th className="debug-only">ID</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr>
                        <td colSpan={4}>Laden...</td>
                    </tr>
                ) : invites.length === 0 ? (
                    <tr>
                        <td colSpan={4}>Keine Einladungen vorhanden</td>
                    </tr>
                ) : (
                    invites.map((invite) => (
                        <TeamInviteTableRow
                            key={invite.id}
                            invite={invite}
                            team={team}
                        />
                    ))
                )}
            </tbody>

            <Dashboard.TableButtonFooter>
                <button
                    type="button"
                    className="btn btn-outline-success border-1"
                    onClick={handleInviteCreateButtonClick}
                >
                    Einladung erstellen
                </button>
            </Dashboard.TableButtonFooter>
        </Dashboard.Table>
    );
}
