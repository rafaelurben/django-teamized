'use strict';

/**
 * Home page component
 */

import React from 'react';

import { CHANGELOG } from '../../data/changelog.js';
import { getDateString } from '../../utils/datetime.ts';
import * as Dashboard from '../common/dashboard.tsx';
import * as Utils from '../../utils/utils.ts';
import * as Settings from '../../utils/settings.ts';
import * as Navigation from '../../utils/navigation.tsx';
import { IconTooltip } from '../tooltips.jsx';

export default class Page_Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = { changelogAmount: 5 };
    }

    applyAppearance(evt) {
        let val = evt.target.value;
        let darkmode = val === 'dark' ? true : val === 'light' ? false : null;
        Settings.editSettings({ darkmode }).then(Navigation.renderPage);
    }

    render() {
        let canExpandChangelog = CHANGELOG.length > this.state.changelogAmount;
        let canCollapseChangelog = this.state.changelogAmount > 5;
        let changelogItems = CHANGELOG.slice(0, this.state.changelogAmount);

        return (
            <Dashboard.Page
                title="Startseite"
                subtitle={`Hallo ${this.props.user.first_name}`}
                loading={this.props.settings === undefined}
            >
                <Dashboard.Column sizes={{ lg: 8 }}>
                    <Dashboard.Tile title="Willkommen">
                        <p className="ms-1 mb-1">
                            <span>
                                Verwende die Menuleiste (rechts) und die
                                Seitenleiste (links), um zu navigieren.
                            </span>
                            <a
                                onClick={Utils.toggleDebug}
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
                            <b>Hinweis</b>: Diese Seite wurde zwar auch für
                            mobile Geräte optimiert, funktioniert aber besser
                            auf grösseren Geräten.
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
                                    onChange={this.applyAppearance}
                                    checked={
                                        this.props.settings.darkmode === true
                                    }
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
                                    onChange={this.applyAppearance}
                                    checked={
                                        this.props.settings.darkmode === null
                                    }
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
                                    onChange={this.applyAppearance}
                                    checked={
                                        this.props.settings.darkmode === false
                                    }
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
                                automatisch dem des Systems oder Browsers
                                angepasst.
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
                            {changelogItems.map((item, i) => [
                                <h6 key={i + 'header'}>
                                    <b>{getDateString(new Date(item.date))}</b>
                                    {item.milestone ? (
                                        <IconTooltip
                                            icon="fa-solid fa-flag ms-2 text-danger"
                                            title="Meilenstein"
                                        />
                                    ) : (
                                        ''
                                    )}
                                </h6>,
                                <ul key={i + 'list'} className="small">
                                    {item.changes.map((change, j) => (
                                        <li key={j}>{change}</li>
                                    ))}
                                </ul>,
                            ])}
                            {canCollapseChangelog ? (
                                <a
                                    className="btn btn-outline-primary btn-sm me-2"
                                    onClick={() =>
                                        this.setState({
                                            changelogAmount: Math.max(
                                                5,
                                                this.state.changelogAmount - 3
                                            ),
                                        })
                                    }
                                    style={{ marginTop: '-0.75rem' }}
                                >
                                    Weniger anzeigen
                                </a>
                            ) : null}
                            {canExpandChangelog ? (
                                <a
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() =>
                                        this.setState({
                                            changelogAmount: Math.min(
                                                CHANGELOG.length,
                                                this.state.changelogAmount + 3
                                            ),
                                        })
                                    }
                                    style={{ marginTop: '-0.75rem' }}
                                >
                                    Mehr anzeigen
                                </a>
                            ) : null}
                        </div>
                    </Dashboard.Tile>
                </Dashboard.Column>
            </Dashboard.Page>
        );
    }
}
