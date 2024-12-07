import React, { useEffect } from 'react';

import { Team } from '../../../interfaces/teams/team';
import * as CacheService from '../../../service/cache.service';
import * as NavigationService from '../../../service/navigation.service';
import * as TeamsService from '../../../service/teams.service';
import Dashboard from '../../common/dashboard';
import IconTooltip from '../../common/tooltips/iconTooltip';
import TeamInviteTableRow from './teamInviteTableRow';

interface Props {
    team: Team;
}

export default function TeamInviteTable({ team }: Props) {
    const invites = Object.values(CacheService.getTeamData(team.id).invites);
    const loading = CacheService.getCurrentTeamData()._state.invites._initial;

    useEffect(() => {
        if (loading) TeamsService.getInvites(team.id); // will re-render page
    });

    const handleInviteCreateButtonClick = async () => {
        await TeamsService.createInvitePopup(team);
        NavigationService.render();
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
