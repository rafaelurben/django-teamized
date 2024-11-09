import React, { useEffect, useState } from 'react';

import IconTooltip from '../../common/tooltips/iconTooltip';
import * as Cache from '../../../utils/cache';
import { Team } from '../../../interfaces/teams/team';
import * as Club from '../../../utils/club';
import ClubMembersTable from './clubMembersTable';
import ClubGroupsTable from './clubGroupsTable';

interface Props {
    team: Team;
    isAdmin: boolean;
    isOwner: boolean;
}

export default function ClubMemberTileContent({
    team,
    isAdmin,
    isOwner,
}: Props) {
    const [selectedTab, setSelectedTab] = useState('all');

    const teamData = Cache.getTeamData(team.id)!;

    const clubMembers = Object.values(teamData.club_members);
    const clubGroups = Object.values(teamData.club_groups);
    const clubMembersLoading = teamData._state.club_members._initial;
    const clubGroupsLoading = teamData._state.club_groups._initial;

    useEffect(() => {
        if (clubMembersLoading) Club.getClubMembers(team.id); // will re-render page
        if (clubGroupsLoading) Club.getClubGroups(team.id); // will re-render page
    }, []);

    if (clubMembersLoading || clubGroupsLoading) {
        return <p className="ms-2">Wird geladen...</p>;
    }

    return (
        <>
            <div key="nav" className="m-2 border-0">
                <ul key="ul" className="nav nav-tabs">
                    <li key="all" className="nav-item">
                        <button
                            className={
                                selectedTab === 'all'
                                    ? 'nav-link active'
                                    : 'nav-link'
                            }
                            onClick={() => setSelectedTab('all')}
                        >
                            Alle ({clubMembers.length})
                        </button>
                    </li>
                    {clubGroups.map((clubGroup) => {
                        return (
                            <li key={clubGroup.id} className="nav-item">
                                <button
                                    className={
                                        selectedTab === clubGroup.id
                                            ? 'nav-link active'
                                            : 'nav-link'
                                    }
                                    onClick={() => setSelectedTab(clubGroup.id)}
                                >
                                    {clubGroup.name} (
                                    {clubGroup.memberids.length})
                                    {clubGroup.description ? (
                                        <IconTooltip
                                            className="ms-1"
                                            title={clubGroup.description}
                                        />
                                    ) : null}
                                </button>
                            </li>
                        );
                    })}
                    <li key="edit" className="nav-item ms-auto">
                        <button
                            className={
                                selectedTab === 'edit'
                                    ? 'nav-link active'
                                    : 'nav-link'
                            }
                            onClick={() => setSelectedTab('edit')}
                        >
                            <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                    </li>
                </ul>
            </div>
            {selectedTab === 'all' ? (
                // All club members
                <ClubMembersTable
                    key="table"
                    team={team}
                    clubMembers={clubMembers}
                    isAdmin={isAdmin}
                    isOwner={isOwner}
                />
            ) : selectedTab === 'edit' ? (
                // Edit club groups
                <ClubGroupsTable
                    key="table"
                    team={team}
                    clubGroups={clubGroups}
                    isAdmin={isAdmin}
                />
            ) : (
                // Club members in selected group
                <ClubMembersTable
                    key="table"
                    team={team}
                    clubMembers={clubMembers.filter((cm) =>
                        teamData.club_groups[selectedTab].memberids.includes(
                            cm.id
                        )
                    )}
                    isAdmin={isAdmin}
                    isOwner={isOwner}
                />
            )}
        </>
    );
}
