import React, { useEffect } from 'react';

import { TeamCache } from '../../../interfaces/cache/teamCache';
import * as TeamsService from '../../../service/teams.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import Tables from '../../common/tables';
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
        <Tables.SimpleTable>
            <thead>
                <tr>
                    <th>Notiz</th>
                    <Tables.Th noWrapFlex={true}>
                        <span>Teilen</span>
                        <IconTooltip title="Auf Icons klicken, um Token bzw. Link zu kopieren" />
                    </Tables.Th>
                    <th style={{ minWidth: '6rem' }}>Gültig bis</th>
                    <Tables.Th noWrapFlex={true}>
                        <span>Verwendungen</span>
                        <IconTooltip title="Bereits verwendet / noch verfügbar" />
                    </Tables.Th>
                    <th style={{ width: '1px' }}></th>
                    <th style={{ width: '1px' }}></th>
                    <th className="debug-id">ID</th>
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

            <Tables.ButtonFooter>
                <button
                    type="button"
                    className="btn btn-outline-success border-1"
                    onClick={handleInviteCreateButtonClick}
                >
                    Einladung erstellen
                </button>
            </Tables.ButtonFooter>
        </Tables.SimpleTable>
    );
}
