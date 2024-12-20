import React, { useEffect } from 'react';

import { Member } from '../../../interfaces/teams/member';
import { Team } from '../../../interfaces/teams/team';
import * as CacheService from '../../../service/cache.service';
import * as TeamsService from '../../../service/teams.service';
import Dashboard from '../../common/dashboard';
import IconTooltip from '../../common/tooltips/iconTooltip';
import TeamMembersTableRow from './teamMemberTableRow';

interface Props {
    team: Team;
    loggedInMember: Member;
}

export default function TeamMemberTable({ team, loggedInMember }: Props) {
    const members = Object.values(CacheService.getTeamData(team.id).members);
    const loading = CacheService.getCurrentTeamData()._state.members._initial;

    useEffect(() => {
        if (loading) TeamsService.getMembers(team.id); // will re-render page
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
                    <th className="debug-only">ID</th>
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
