/**
 *  This component is used to render the part of the menubar that is only on the app page.
 *  I.e. account, home and logout buttons are not created here.
 */

import React from 'react';

import { refresh } from '../app';
import { Team } from '../interfaces/teams/team';
import { User } from '../interfaces/user';
import * as NavigationService from '../service/navigation.service';
import * as GeneralUtils from '../utils/general';
import {
    useNavigationState,
    useNavigationStateDispatch,
    usePageNavigatorAsEventHandler,
} from '../utils/navigation/navigationProvider';

interface Props {
    teams: Team[];
    user: User;
}

export default function AppMenubar({ teams, user }: Props) {
    const { selectedTeamId } = useNavigationState();

    const selectPage = usePageNavigatorAsEventHandler();
    const updateNavigationState = useNavigationStateDispatch();

    const handleTeamSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateNavigationState({ update: { selectedTeamId: e.target.value } });
    };

    const globals = window.teamized_globals;

    return (
        <nav
            id="menubar"
            className="navbar navbar-expand-lg bg-dark"
            data-bs-theme="dark"
        >
            <div className="container-fluid">
                {/* Sidebar trigger with menubar title */}
                <a
                    id="menubartitle"
                    className="navbar-brand ms-1 sidebar-toggle"
                    href="#"
                    onClick={() => NavigationService.toggleSidebar()}
                >
                    <i className="fa-fw fa-solid fa-square-caret-left when-open"></i>
                    <i className="fa-fw fa-solid fa-square-caret-right when-closed"></i>
                    <span className="ms-1">Teamized</span>
                </a>
                {/* Navbar toggle for small devices */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbar"
                    aria-controls="navbar"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                {/* Navigation bar */}
                <div className="collapse navbar-collapse" id="navbar">
                    <ul className="navbar-nav nav w-100 me-1 mb-2 justify-content-end">
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
                        <li
                            className="nav-item border-lg rounded border-secondary ms-2"
                            id="refreshbutton"
                        >
                            <a
                                className="nav-link ms-1 me-1"
                                href="#"
                                onClick={() => refresh()}
                                title="Neu laden (F5)"
                            >
                                <i className="fas fa-fw fa-rotate"></i>
                                <span className="d-lg-none ms-2">
                                    Neu laden
                                </span>
                            </a>
                        </li>
                        {/* Hidden DEBUG menu item (activate via Shift+F6) */}
                        <li className="nav-item dropdown border-lg rounded border-danger ms-2 debug-only">
                            <a
                                className="nav-link dropdown-toggle ms-1 me-1 text-danger"
                                href="#"
                                title="DEBUG MENU"
                                role="button"
                                data-bs-toggle="dropdown"
                            >
                                <i className="fas fa-fw fa-bug"></i>
                                <span className="d-lg-none ms-2">
                                    DEBUG MENU
                                </span>
                            </a>
                            <ul className="dropdown-menu">
                                <li>
                                    <a
                                        className="dropdown-item text-info"
                                        href="#"
                                        onClick={() =>
                                            window.open(
                                                globals.debug_url,
                                                '_blank'
                                            )
                                        }
                                    >
                                        DEBUG-Seite öffnen
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="dropdown-item text-danger"
                                        href="#"
                                        onClick={() =>
                                            GeneralUtils.toggleDebug()
                                        }
                                    >
                                        DEBUG-Modus verlassen (Shift+F6)
                                    </a>
                                </li>
                                <li className="dropdown-divider"></li>
                                <li>
                                    <a
                                        className="dropdown-item"
                                        href="#"
                                        onClick={() => {
                                            NavigationService.reRender();
                                            alert('Done!');
                                        }}
                                    >
                                        NavigationService.reRender()
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="dropdown-item"
                                        href="#"
                                        onClick={() => window.location.reload()}
                                    >
                                        location.reload()
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item border-lg rounded border-secondary ms-2">
                            <a
                                className="nav-link ms-1 me-1"
                                href={globals.account_url}
                                title="Account"
                            >
                                <i className="fas fa-fw fa-user"></i>
                                <span className="d-lg-none ms-2">Account:</span>
                                <span className="navbar-text ms-0 ms-lg-2">
                                    {user.username}
                                </span>
                            </a>
                        </li>
                        <li className="nav-item border-lg rounded border-secondary ms-2">
                            <a
                                className="nav-link ms-1 me-1"
                                href={globals.home_url}
                                title="Startseite"
                            >
                                <i className="fas fa-fw fa-home"></i>
                                <span className="d-lg-none ms-2">
                                    Startseite
                                </span>
                            </a>
                        </li>
                        <li className="nav-item border-lg rounded border-secondary ms-2">
                            <a
                                className="nav-link ms-1 me-1"
                                href={globals.logout_url}
                                title="Logout"
                            >
                                <i className="fas fa-fw fa-sign-out-alt"></i>
                                <span className="d-lg-none ms-2">Logout</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
