import React from 'react';

import { ClubMember } from '../../../interfaces/club/clubMember';
import { Team } from '../../../interfaces/teams/team';
import * as ClubService from '../../../service/clubs.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import Dashboard from '../../common/dashboard';
import IconTooltip from '../../common/tooltips/iconTooltip';
import ClubMembersTableRow from './clubMembersTableRow';

interface Props {
    team: Team;
    clubMembers: ClubMember[];
    isAdmin: boolean;
    isOwner: boolean;
}

export default function ClubMembersTable({
    team,
    clubMembers,
    isAdmin,
    isOwner,
}: Props) {
    const refreshData = useAppdataRefresh();

    const handleCreateButtonClick = () => {
        ClubService.createClubMemberPopup(team).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    return (
        <Dashboard.Table>
            <thead>
                <tr>
                    <th>Vorname</th>
                    <th>Nachname</th>
                    <th>Geburtsdatum</th>
                    <th style={{ minWidth: '15rem' }}>
                        E-Mail-Adresse{' '}
                        <IconTooltip
                            title="Eine E-Mail-Adresse kann nicht mehrfach verwendet werden."
                            icon="fas fa-circle-exclamation text-warning"
                        />
                    </th>
                    {isOwner && (
                        <>
                            <th style={{ width: '1px' }}></th>
                        </>
                    )}
                    {isAdmin && (
                        <>
                            <th style={{ width: '1px' }}></th>
                            <th style={{ width: '1px' }}></th>
                            <th style={{ width: '1px' }}></th>
                            <th style={{ width: '1px' }}></th>
                        </>
                    )}
                    <th className="debug-id">ID</th>
                </tr>
            </thead>
            <tbody>
                {clubMembers.map((clubMember) => (
                    <ClubMembersTableRow
                        key={clubMember.id}
                        clubMember={clubMember}
                        team={team}
                        isAdmin={isAdmin}
                        isOwner={isOwner}
                    />
                ))}
            </tbody>

            <Dashboard.TableButtonFooter show={isAdmin}>
                <button
                    type="button"
                    className="btn btn-outline-success border-1"
                    onClick={handleCreateButtonClick}
                >
                    Mitglied erstellen
                </button>
            </Dashboard.TableButtonFooter>
        </Dashboard.Table>
    );
}
