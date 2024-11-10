import React, { useState } from 'react';

import { CHANGELOG } from '../../../data/changelog';
import { getDateString } from '../../../utils/datetime';
import * as Dashboard from '../../common/dashboard';
import * as Utils from '../../../utils/utils';
import * as SettingsUtils from '../../../utils/settings';
import * as Navigation from '../../../utils/navigation';
import IconTooltip from '../../common/tooltips/iconTooltip';
import { User } from '../../../interfaces/user';
import { Settings } from '../../../interfaces/settings';

interface Props {
    user: User;
    settings: Settings;
}

export default function HomePage({ user, settings }: Props) {
    const [changelogAmount, setChangelogAmount] = useState(5);

    const canExpandChangelog = CHANGELOG.length > changelogAmount;
    const canCollapseChangelog = changelogAmount > 5;
    const changelogItems = CHANGELOG.slice(0, changelogAmount);

    const applyAppearance = (evt: React.ChangeEvent<HTMLInputElement>) => {
        const val = evt.target.value;
        const darkmode = val === 'dark' ? true : val === 'light' ? false : null;
        SettingsUtils.editSettings({ darkmode }).then(Navigation.renderPage);
    };

    return (
        <Dashboard.Page
            title="Startseite"
            subtitle={`Hallo ${user.first_name}`}
            loading={settings === undefined}
        >
            <Dashboard.Column sizes={{ lg: 8 }}>
                <Dashboard.Tile title="Willkommen">
                    <p className="ms-1 mb-1">
                        <span>
                            Verwende die Menuleiste (rechts) und die
                            Seitenleiste (links), um zu navigieren.
                        </span>
                        <a
                            onClick={() => Utils.toggleDebug()}
                            style={{ opacity: 0 }}
                            className="ms-1"
                            aria-hidden="true"
                        >
                            DEBUG
                        </a>
                    </p>
                    <div
                        className="alert alert-warning d-md-none m-1 mt-2"
                        role="alert"
                        aria-hidden="true"
                    >
                        <b>Hinweis</b>: Diese Seite wurde zwar auch für mobile
                        Geräte optimiert, funktioniert aber besser auf grösseren
                        Geräten.
                    </div>
                </Dashboard.Tile>
                <Dashboard.Tile title="Einstellungen">
                    <div className="mb-2 ms-1">
                        <label htmlFor="appearance" className="form-label">
                            Erscheinungsbild
                        </label>
                        <div
                            className="btn-group form-control px-2"
                            role="group"
                        >
                            <input
                                type="radio"
                                className="btn-check"
                                name="appearance"
                                value="dark"
                                id="appearance_dark"
                                onChange={applyAppearance}
                                checked={settings.darkmode === true}
                            />
                            <label
                                className="btn btn-outline-primary"
                                htmlFor="appearance_dark"
                            >
                                Dunkel
                            </label>

                            <input
                                type="radio"
                                className="btn-check"
                                name="appearance"
                                value="auto"
                                id="appearance_auto"
                                onChange={applyAppearance}
                                checked={settings.darkmode === null}
                            />
                            <label
                                className="btn btn-outline-primary"
                                htmlFor="appearance_auto"
                            >
                                Automatisch
                            </label>

                            <input
                                type="radio"
                                className="btn-check"
                                name="appearance"
                                value="light"
                                id="appearance_light"
                                onChange={applyAppearance}
                                checked={settings.darkmode === false}
                            />
                            <label
                                className="btn btn-outline-primary"
                                htmlFor="appearance_light"
                            >
                                Hell
                            </label>
                        </div>
                        <div className="form-text">
                            Bei "Automatisch" wird das Erscheinungsbild
                            automatisch dem des Systems oder Browsers angepasst.
                        </div>
                    </div>
                </Dashboard.Tile>
            </Dashboard.Column>
            <Dashboard.Column sizes={{ lg: 4 }}>
                <Dashboard.Tile
                    title="Neuste Updates"
                    help="Neue Funktionen, Bugfixes und Änderungen"
                >
                    <div className="m-1">
                        {changelogItems.map((item, i) => (
                            <React.Fragment key={i}>
                                <h6>
                                    <b>{getDateString(new Date(item.date))}</b>
                                    {item.milestone ? (
                                        <IconTooltip
                                            icon="fa-solid fa-flag ms-2 text-danger"
                                            title="Meilenstein"
                                        />
                                    ) : (
                                        ''
                                    )}
                                </h6>
                                <ul className="small">
                                    {item.changes.map((change, j) => (
                                        <li key={j}>{change}</li>
                                    ))}
                                </ul>
                            </React.Fragment>
                        ))}
                        <button
                            className="btn btn-outline-primary btn-sm me-2"
                            onClick={() =>
                                setChangelogAmount(
                                    Math.max(5, changelogAmount - 3)
                                )
                            }
                            style={{ marginTop: '-0.75rem' }}
                            disabled={!canCollapseChangelog}
                        >
                            Weniger anzeigen
                        </button>
                        <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() =>
                                setChangelogAmount(
                                    Math.min(
                                        CHANGELOG.length,
                                        changelogAmount + 3
                                    )
                                )
                            }
                            style={{ marginTop: '-0.75rem' }}
                            disabled={!canExpandChangelog}
                        >
                            Mehr anzeigen
                        </button>
                    </div>
                </Dashboard.Tile>
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
