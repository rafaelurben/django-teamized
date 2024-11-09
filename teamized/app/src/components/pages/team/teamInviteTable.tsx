import React, { useEffect } from 'react';

import * as Dashboard from '../../common/dashboard';
import { IconTooltip } from '../../common/tooltips/iconTooltip';
import * as Cache from '../../../utils/cache';
import * as Teams from '../../../utils/teams';
import { Team } from '../../../interfaces/teams/team';
import TeamInviteTableRow from './teamInviteTableRow';
import * as Navigation from '../../../utils/navigation';

interface Props {
    team: Team;
}

export default function TeamInviteTable({ team }: Props) {
    const invites = Object.values(Cache.getTeamData(team.id).invites);
    const loading = Cache.getCurrentTeamData()._state.invites._initial;

    useEffect(() => {
        if (loading) Teams.getInvites(team.id); // will re-render page
    }, []);

    const handleInviteCreateButtonClick = async () => {
        await Teams.createInvitePopup(team);
        Navigation.renderPage();
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
