/**
 *  This component is used to render the sidebar.
 *  Most of it is inspired or copied from https://getbootstrap.com/docs/5.1/examples/sidebars/
 */

import React from 'react';

import { User } from '../interfaces/user';
import {
    useCurrentTeamData,
    useNavigationState,
    usePageNavigatorAsEventHandler,
    usePageNavigatorURL,
} from '../utils/navigation/navigationProvider';

interface Props {
    user: User;
}

export default function AppSidebar({ user }: Props) {
    const { selectedPage } = useNavigationState();
    const teamData = useCurrentTeamData();

    const selectPage = usePageNavigatorAsEventHandler();
    const getPageURL = usePageNavigatorURL();

    const getLinkClass = (forPage: string) => {
        if (forPage === selectedPage) {
            return 'nav-link active';
        } else {
            return 'nav-link text-white';
        }
    };

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark sidebar h-100">
            <ul className="nav nav-pills flex-column mb-auto flex-nowrap overflow-auto">
                <li>
                    <a
                        href={getPageURL('home')}
                        className={getLinkClass('home')}
                        onClick={selectPage('home')}
                    >
                        <i className="fas fa-fw fa-home" />
                        Startseite
                    </a>
                </li>
                <li>
                    <a
                        href={getPageURL('teamlist')}
                        className={getLinkClass('teamlist')}
                        onClick={selectPage('teamlist')}
                    >
                        <i className="fas fa-fw fa-user-group" />
                        Teams
                    </a>
                </li>
                <hr className="my-1" />
                <li>
                    <a
                        href={getPageURL('team')}
                        className={getLinkClass('team')}
                        onClick={selectPage('team')}
                    >
                        <i className="fas fa-fw fa-users-viewfinder" />
                        Team
                    </a>
                </li>
                <li>
                    <a
                        href={getPageURL('workingtime')}
                        className={getLinkClass('workingtime')}
                        onClick={selectPage('workingtime')}
                    >
                        <i className="fas fa-fw fa-business-time" />
                        Arbeitszeit
                    </a>
                </li>
                <li>
                    <a
                        href={getPageURL('calendars')}
                        className={getLinkClass('calendars')}
                        onClick={selectPage('calendars')}
                    >
                        <i className="fas fa-fw fa-calendar-days" />
                        Kalender
                    </a>
                </li>
                <li>
                    <a
                        href={getPageURL('todo')}
                        className={getLinkClass('todo')}
                        onClick={selectPage('todo')}
                    >
                        <i className="fas fa-fw fa-tasks" />
                        To-do-Listen
                    </a>
                </li>
                {teamData !== null && teamData.team.club !== null && (
                    <>
                        <hr className="my-1" />
                        <li>
                            <a
                                href={getPageURL('club')}
                                className={getLinkClass('club')}
                                onClick={selectPage('club')}
                            >
                                <i className="fas fa-fw fa-people-group" />
                                Verein
                            </a>
                        </li>
                        <li>
                            <a
                                href={getPageURL('club_presence')}
                                className={getLinkClass('club_presence')}
                                onClick={selectPage('club_presence')}
                            >
                                <i className="fas fa-fw fa-table-list" />
                                Anwesenheit
                                {/* New badge - remove later */}
                                <span className="badge bg-info ms-2">Neu</span>
                            </a>
                        </li>
                    </>
                )}
            </ul>
            <hr />
            <div className="dropup">
                <a
                    href="#"
                    className="d-flex align-items-center text-white text-decoration-none dropdown-toggle me-2"
                    id="dropdownUser1"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    <img
                        src={user.avatar_url}
                        alt=""
                        width="32"
                        height="32"
                        className="rounded-circle me-2"
                    />
                    <strong className="me-2">{user.username}</strong>
                </a>
                <ul
                    className="dropdown-menu text-small shadow"
                    aria-labelledby="dropdownUser1"
                >
                    <li>
                        <a
                            className="dropdown-item"
                            href={window.teamized_globals.account_url}
                        >
                            <i className="me-2 fas fa-fw fa-user"></i>
                            Account
                        </a>
                    </li>
                    <li>
                        <a
                            className="dropdown-item"
                            href="https://de.gravatar.com/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <i className="me-2 fas fa-fw fa-arrow-up-right-from-square"></i>
                            Avatar
                        </a>
                    </li>
                    <li>
                        <hr className="dropdown-divider" />
                    </li>
                    <li>
                        <a
                            className="dropdown-item"
                            href={window.teamized_globals.logout_url}
                        >
                            <i className="me-2 fas fa-fw fa-arrow-right-from-bracket"></i>
                            Ausloggen
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}
