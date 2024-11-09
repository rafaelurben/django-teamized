import React, { useEffect } from 'react';

import { Member } from '../../../interfaces/teams/member';
import * as Dashboard from '../../common/dashboard';
import IconTooltip from '../../common/tooltips/iconTooltip';
import * as Cache from '../../../utils/cache';
import * as Teams from '../../../utils/teams';
import TeamMembersTableRow from './teamMemberTableRow';
import { Team } from '../../../interfaces/teams/team';

interface Props {
    team: Team;
    loggedInMember: Member;
}

export default function TeamMemberTable({ team, loggedInMember }: Props) {
    const members = Object.values(Cache.getTeamData(team.id).members);
    const loading = Cache.getCurrentTeamData()._state.members._initial;

    useEffect(() => {
        if (loading) Teams.getMembers(team.id); // will re-render page
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
