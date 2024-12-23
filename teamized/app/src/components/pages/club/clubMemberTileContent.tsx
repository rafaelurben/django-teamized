import React, { useEffect, useState } from 'react';

import { TeamCache } from '../../../interfaces/cache/teamCache';
import * as ClubService from '../../../service/clubs.service';
import IconTooltip from '../../common/tooltips/iconTooltip';
import ClubGroupsTable from './clubGroupsTable';
import ClubMembersTable from './clubMembersTable';

interface Props {
    teamData: TeamCache;
}

export default function ClubMemberTileContent({ teamData }: Props) {
    const [selectedTab, setSelectedTab] = useState('all');

    const team = teamData.team;
    const isOwner = teamData.team.member!.is_owner;
    const isAdmin = teamData.team.member!.is_admin;

    const clubMembers = Object.values(teamData.club_members);
    const clubGroups = Object.values(teamData.club_groups);
    const clubMembersLoading = teamData._state.club_members._initial;
    const clubGroupsLoading = teamData._state.club_groups._initial;

    useEffect(() => {
        if (clubMembersLoading) ClubService.getClubMembers(team.id); // will re-render page
        if (clubGroupsLoading) ClubService.getClubGroups(team.id); // will re-render page
    });

    if (clubMembersLoading || clubGroupsLoading) {
        return <p className="ms-2">Wird geladen...</p>;
    }

    return (
        <>
            <div className="m-2 border-0">
                <ul className="nav nav-tabs">
                    <li className="nav-item">
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
                    {clubGroups.map((clubGroup) => (
                        <li key={clubGroup.id} className="nav-item">
                            <button
                                className={
                                    selectedTab === clubGroup.id
                                        ? 'nav-link active'
                                        : 'nav-link'
                                }
                                onClick={() => setSelectedTab(clubGroup.id)}
                            >
                                {clubGroup.name} ({clubGroup.memberids.length})
                                {clubGroup.description && (
                                    <IconTooltip
                                        className="ms-1"
                                        title={clubGroup.description}
                                    />
                                )}
                            </button>
                        </li>
                    ))}
                    <li className="nav-item ms-auto">
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
                    team={team}
                    clubMembers={clubMembers}
                    isAdmin={isAdmin}
                    isOwner={isOwner}
                />
            ) : selectedTab === 'edit' ? (
                // Edit club groups
                <ClubGroupsTable
                    team={team}
                    clubGroups={clubGroups}
                    isAdmin={isAdmin}
                />
            ) : (
                // Club members in selected group
                <ClubMembersTable
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
