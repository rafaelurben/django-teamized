/**
 *  This component is used to render the part of the menubar that is only on the app page.
 *  I.e. account, home and logout buttons are not created here.
 */

import React from 'react';
import { ID } from '../interfaces/common';
import { Team } from '../interfaces/teams/team';

interface Props {
    teams: Team[];
    selectedTeamId: ID;
    onTeamSelect: (teamId: ID) => any;
    onPageSelect: (page: string) => any;
}

export default function AppMenubar({
    teams,
    selectedTeamId,
    onTeamSelect,
    onPageSelect,
}: Props) {
    const handleTeamSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onTeamSelect(e.target.value);
    };

    // Note: Calling this function with the page parameter returns a new function
    // that will be called when an event fires.
    const selectPage = (page: string) => () => {
        onPageSelect(page);
    };

    return (
        <div
            className="btn-group border rounded border-secondary ms-2"
            role="group"
            aria-label="team management menubar"
        >
            {/* Team list button */}
            <li className="nav-item border-secondary border-end">
                <a
                    className="nav-link mx-1 px-2"
                    onClick={selectPage('teamlist')}
                    title="Zur Teamliste"
                    href="#"
                >
                    <i className="fas fa-fw fa-user-group"></i>
                </a>
            </li>

            {/* Team switcher */}
            <select
                id="teamswitcher"
                value={selectedTeamId || ''}
                className="form-select"
                title="Team auswählen"
                onInput={handleTeamSelect}
                style={{ color: 'var(--bs-navbar-color)' }}
            >
                {teams.length == 0 ? (
                    <option value="">Laden...</option>
                ) : (
                    teams.map((team) => (
                        <option key={team.id} value={team.id}>
                            {team.name}
                        </option>
                    ))
                )}
            </select>

            {/* Team option button */}
            <li className="nav-item border-secondary border-start">
                <a
                    className="nav-link mx-1 px-2"
                    onClick={selectPage('team')}
                    title="Zur Teamseite"
                    href="#"
                >
                    <i className="fas fa-fw fa-users-viewfinder"></i>
                </a>
            </li>
        </div>
    );
}
