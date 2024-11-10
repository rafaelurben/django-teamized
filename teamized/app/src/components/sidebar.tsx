/**
 *  This component is used to render the sidebar.
 *  Most of it is inspired or copied from https://getbootstrap.com/docs/5.1/examples/sidebars/
 */

import React from 'react';
import { User } from '../interfaces/user';

interface Props {
    selectedPage: string;
    user: User;
    isAdmin: boolean;
    isClubEnabled: boolean;
    onPageSelect: (page: string) => any;
}

export default function AppSidebar({
    user,
    isClubEnabled,
    selectedPage,
    onPageSelect,
}: Props) {
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
                        href="#"
                        className={getLinkClass('home')}
                        onClick={() => onPageSelect('home')}
                    >
                        <i className="fas fa-fw fa-home" />
                        Startseite
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        className={getLinkClass('teamlist')}
                        onClick={() => onPageSelect('teamlist')}
                    >
                        <i className="fas fa-fw fa-user-group" />
                        Teams
                    </a>
                </li>
                <hr className="my-1" />
                <li>
                    <a
                        href="#"
                        className={getLinkClass('team')}
                        onClick={() => onPageSelect('team')}
                    >
                        <i className="fas fa-fw fa-users-viewfinder" />
                        Team
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        className={getLinkClass('workingtime')}
                        onClick={() => onPageSelect('workingtime')}
                    >
                        <i className="fas fa-fw fa-business-time" />
                        Arbeitszeit
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        className={getLinkClass('calendars')}
                        onClick={() => onPageSelect('calendars')}
                    >
                        <i className="fas fa-fw fa-calendar-days" />
                        Kalender
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        className={getLinkClass('todo')}
                        onClick={() => onPageSelect('todo')}
                    >
                        <i className="fas fa-fw fa-tasks" />
                        To-do-Listen
                    </a>
                </li>
                {isClubEnabled && (
                    <>
                        <hr className="my-1" />
                        <li>
                            <a
                                href="#"
                                className={getLinkClass('club')}
                                onClick={() => onPageSelect('club')}
                            >
                                <i className="fas fa-fw fa-people-group" />
                                Verein
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
                            href="/account/?next=/teamized/app/"
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
                            href="/account/logout?next=/teamized/"
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
