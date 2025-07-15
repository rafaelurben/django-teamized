import React, { useEffect } from 'react';

import { TeamCache } from '../../../interfaces/cache/teamCache';
import * as TeamsService from '../../../service/teams.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import Dashboard from '../../common/dashboard';
import IconTooltip from '../../common/tooltips/iconTooltip';
import TeamMembersTableRow from './teamMemberTableRow';

interface Props {
    teamData: TeamCache;
}

export default function TeamMemberTable({ teamData }: Props) {
    const refreshData = useAppdataRefresh();

    const team = teamData.team;
    const loggedInMember = team.member!;

    const members = Object.values(teamData.members);
    const loading = teamData._state.members._initial;

    useEffect(() => {
        if (loading) {
            TeamsService.getMembers(team.id).then(refreshData);
        }
    });

    return (
        <Dashboard.Table>
            <thead>
                <tr>
                    <th style={{ width: '32px' }} className="text-center">
                        <IconTooltip title="Das Profilbild wird anhand der E-Mail-Adresse auf gravatar.com abgerufen" />
                    </th>
                    <th>Name</th>
                    <th>Benutzername&nbsp;&amp;&nbsp;E-Mail</th>
                    <th>Rolle</th>
                    {loggedInMember.is_owner && (
                        <th style={{ width: '1px' }}></th>
                    )}
                    <th style={{ width: '1px' }}></th>
                    <th className="debug-id">ID</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr>
                        <td colSpan={4}>Laden...</td>
                    </tr>
                ) : (
                    members.map((member) => (
                        <TeamMembersTableRow
                            key={member.id}
                            member={member}
                            team={team}
                            loggedInMember={team.member!}
                        />
                    ))
                )}
            </tbody>
        </Dashboard.Table>
    );
}
