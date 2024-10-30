'use strict';

/**
 * Workingtime page component (main component at the bottom of this file)
 */

import React from 'react';
import * as Recharts from 'recharts';

import { errorAlert } from '../../utils/alerts.js';
import * as Navigation from '../../utils/navigation.js';
import * as WorkingTime from '../../utils/workingtime.js';
import * as Cache from '../../utils/cache.js';
import * as Dashboard from '../dashboard.jsx';
import { IconTooltip } from '../tooltips.jsx';
import * as Stats from '../../utils/workingtimestats.js';
import {
    roundDays,
    localInputFormat,
    ms2HoursMinutesSeconds,
    seconds2HoursMinutesSeconds,
} from '../../utils/datetime.ts';

class WorkSessionTableRow extends React.Component {
    constructor(props) {
        super(props);
        this.getDurationDisplay = this.getDurationDisplay.bind(this);
        this.handleDeleteButtonClick = this.handleDeleteButtonClick.bind(this);
        this.handleEditButtonClick = this.handleEditButtonClick.bind(this);
    }

    async handleDeleteButtonClick() {
        await WorkingTime.deleteWorkSessionPopup(
            this.props.team,
            this.props.session
        );
        Navigation.renderPage();
    }

    async handleEditButtonClick() {
        await WorkingTime.editWorkSessionPopup(
            this.props.team,
            this.props.session
        );
        Navigation.renderPage();
    }

    getDurationDisplay() {
        let data = seconds2HoursMinutesSeconds(this.props.session.duration);
        return `${data.hours}h ${data.minutes}min ${data.seconds}s`;
    }

    render() {
        return (
            <tr>
                <td>
                    <span>
                        {new Date(
                            this.props.session.time_start
                        ).toLocaleString()}{' '}
                        bis
                        <br />
                        {new Date(this.props.session.time_end).toLocaleString()}
                        {this.props.session.is_created_via_tracking ? (
                            <IconTooltip
                                icon="fas fa-stopwatch"
                                title="Diese Sitzung wurde via Aufzeichnung erstellt."
                                className="ms-1"
                            ></IconTooltip>
                        ) : (
                            <IconTooltip
                                icon="fas fa-pencil"
                                title="Diese Sitzung wurde manuell erfasst."
                                className="ms-1"
                            ></IconTooltip>
                        )}
                    </span>
                </td>
                <td>
                    <span>{this.getDurationDisplay()}</span>
                </td>
                <td>
                    <span>{this.props.session.note}</span>
                </td>
                {/* Action: Edit */}
                <td>
                    <a
                        className="btn btn-outline-dark border-1"
                        onClick={this.handleEditButtonClick}
                        title="Sitzung bearbeiten"
                    >
                        <i className="fas fa-fw fa-pen-to-square"></i>
                    </a>
                </td>
                {/* Action: Delete */}
                <td>
                    <a
                        className="btn btn-outline-danger border-1"
                        onClick={this.handleDeleteButtonClick}
                        title="Sitzung löschen"
                    >
                        <i className="fas fa-fw fa-trash"></i>
                    </a>
                </td>
                {/* ID */}
                <td className="debug-only">{this.props.session.id}</td>
            </tr>
        );
    }
}

class SessionTable extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Dashboard.Table>
                <thead>
                    <tr>
                        <th style={{ minWidth: '13rem' }}>Start &amp; Ende</th>
                        <th style={{ minWidth: '8rem' }}>Dauer</th>
                        <th style={{ minWidth: '15rem' }}>Notiz</th>
                        <th style={{ width: '1px' }}></th>
                        <th style={{ width: '1px' }}></th>
                        <th className="debug-only">ID</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.sessions.length === 0 ? (
                        <tr>
                            <td colSpan="3">
                                Noch keine Zeiten im ausgewählten Zeitraum
                                erfasst.
                            </td>
                        </tr>
                    ) : (
                        this.props.sessions.map((session) => {
                            return (
                                <WorkSessionTableRow
                                    session={session}
                                    key={session.id}
                                    team={this.props.selectedTeam}
                                />
                            );
                        })
                    )}
                </tbody>
            </Dashboard.Table>
        );
    }
}

class WorkingTimeStats extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let data = Stats.chartDataByDays(
            this.props.sessions,
            this.props.start,
            this.props.end
        );
        let totalHours = Stats.totalDuration(this.props.sessions) / 3600;
        return [
            <div
                className="row row-cols-lg-auto m-1 g-2 align-items-center"
                key="settings"
            >
                <div className="col-12 mt-0">
                    <span className="text-muted">
                        Gesamtdauer: {totalHours.toFixed(2)}h
                    </span>
                </div>
            </div>,
            <Recharts.ResponsiveContainer
                width="100%"
                minHeight={400}
                height="90%"
                key="chart"
            >
                <Recharts.BarChart
                    data={data}
                    margin={{ top: 30, right: 20, left: 0, bottom: 5 }}
                >
                    <Recharts.CartesianGrid strokeDasharray="3 3" />
                    <Recharts.XAxis dataKey="name" />
                    <Recharts.YAxis
                        dataKey="duration_h"
                        domain={[0, 'dataMax']}
                    />
                    <Recharts.Tooltip />
                    <Recharts.Legend />
                    <Recharts.Bar
                        dataKey="duration_h"
                        name="Dauer"
                        unit="h"
                        fill="#8884d8"
                    />
                </Recharts.BarChart>
            </Recharts.ResponsiveContainer>,
        ];
    }
}

export default class Page_WorkingTime extends React.Component {
    constructor(props) {
        super(props);
        this.getTimeDisplay = this.getTimeDisplay.bind(this);
        this.createSession = this.createSession.bind(this);
        this.startSession = this.startSession.bind(this);
        this.stopSession = this.stopSession.bind(this);
        this.updateCurrentSession = this.updateCurrentSession.bind(this);
        this.renameCurrentSession = this.renameCurrentSession.bind(this);
        this.tick = this.tick.bind(this);
        this.applyStatsRange = this.applyStatsRange.bind(this);

        this.state = {
            timeDisplay: this.getTimeDisplay(),
            statsRangeStart: roundDays(
                new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
            ),
            statsRangeEnd: roundDays(new Date(), 1),
        };

        this.clockRefreshIntervalID = 0;
        this.currentSessionRefreshIntervalId = 0;

        this.start_in_progress = false;
        this.stop_in_progress = false;
    }

    applyStatsRange() {
        let start = new Date(
            document.getElementById('stats-range-start').value
        );
        let end = new Date(document.getElementById('stats-range-end').value);
        if (isNaN(start.valueOf()) || isNaN(end.valueOf())) {
            errorAlert('Ungültiges Datum!');
            return;
        }
        if (start > end) {
            errorAlert('Das Startdatum muss vor dem Enddatum liegen.');
            return;
        }
        this.setState({ statsRangeStart: start, statsRangeEnd: end });
    }

    async createSession() {
        await WorkingTime.createWorkSessionPopup(this.props.selectedTeam);
        Navigation.renderPage();
    }

    async startSession() {
        if (!this.start_in_progress) {
            this.start_in_progress = true;
            await WorkingTime.startTrackingSession(this.props.selectedTeamId)
                .then(() => {
                    Navigation.renderPage();
                })
                .catch(errorAlert);
            this.start_in_progress = false;
        }
    }

    async stopSession() {
        if (!this.stop_in_progress) {
            this.stop_in_progress = true;
            await WorkingTime.stopTrackingSession()
                .then(() => {
                    Navigation.renderPage();
                })
                .catch(errorAlert);
            this.stop_in_progress = false;
        }
    }

    async renameCurrentSession() {
        await WorkingTime.renameWorkSessionPopup(
            this.props.selectedTeam,
            this.props.current_worksession
        );
        Navigation.renderPage();
    }

    async updateCurrentSession() {
        const current = this.props.current_worksession;
        const updated = await WorkingTime.getTrackingSession();
        if (
            current !== undefined &&
            current !== updated &&
            (current === null || updated === null || current.id !== updated.id)
        ) {
            Navigation.renderPage();
            WorkingTime.getMyWorkSessionsInTeam(this.props.selectedTeamId);
        }
    }

    getTimeDisplay() {
        if (this.props.current_worksession) {
            const now = new Date();
            const start = new Date(this.props.current_worksession.time_start);
            const timediff = now - start;
            const diff = ms2HoursMinutesSeconds(timediff);
            return `${diff.hours}:${diff.minutes}:${diff.seconds}`;
        } else {
            return '00:00:00';
        }
    }

    componentDidMount() {
        this.clockRefreshIntervalID = setInterval(() => this.tick(), 1000);
        this.updateCurrentSession();
        this.currentSessionRefreshIntervalId = setInterval(
            () => this.updateCurrentSession(),
            15000
        );
    }

    componentWillUnmount() {
        clearInterval(this.clockRefreshIntervalID);
        clearInterval(this.currentSessionRefreshIntervalId);
    }

    tick() {
        let newDisplay = this.getTimeDisplay();
        if (this.state.timeDisplay !== newDisplay) {
            this.setState({ timeDisplay: newDisplay });
        }
    }

    render() {
        let rows;
        let sessions = [];

        if (Cache.getCurrentTeamData()._state.me_worksessions._initial) {
            rows = (
                <tr>
                    <td colSpan="3">Laden...</td>
                </tr>
            );
            WorkingTime.getMyWorkSessionsInTeam(this.props.selectedTeamId);
        } else {
            sessions = Object.values(this.props.worksessions);
            sessions = Stats.filterByDateRange(
                sessions,
                this.state.statsRangeStart,
                this.state.statsRangeEnd
            );
            sessions.sort((a, b) => {
                return new Date(b.time_start) - new Date(a.time_start);
            });
        }

        return (
            <Dashboard.Page
                title="Deine Arbeitszeit"
                subtitle="Erfasse und verwalte deine Arbeitszeit"
                loading={
                    Cache.getCurrentTeamData()._state.me_worksessions._initial
                }
            >
                <Dashboard.Column sizes={{ lg: 3 }}>
                    <Dashboard.Row>
                        <Dashboard.Column
                            size="12"
                            sizes={{ lg: 12, sm: 6, md: 6 }}
                        >
                            <Dashboard.Tile title="Sitzung aufzeichnen" grow>
                                <h1 className="text-center">
                                    {this.state.timeDisplay}
                                </h1>

                                <div className="text-center">
                                    {this.props.current_worksession ? (
                                        <div className="row m-2 g-2">
                                            <button
                                                className="btn btn-danger col-12"
                                                onClick={this.stopSession}
                                            >
                                                Aufzeichnung beenden
                                            </button>
                                            <button
                                                className="btn btn-outline-dark col-12"
                                                onClick={
                                                    this.renameCurrentSession
                                                }
                                            >
                                                Aufzeichnung benennen
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="row m-2">
                                            <button
                                                className="btn btn-success col-12"
                                                onClick={this.startSession}
                                            >
                                                Aufzeichnung starten
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Dashboard.Tile>
                        </Dashboard.Column>
                        <Dashboard.Column
                            size="12"
                            sizes={{ lg: 12, sm: 6, md: 6 }}
                        >
                            <Dashboard.Tile title="Sitzung erfassen" grow>
                                <p className="ms-1">
                                    Aufzeichnung vergessen? Kein Problem. Hier
                                    können Sitzungen nachträglich manuell
                                    erfasst werden.
                                </p>
                                <div className="row m-2">
                                    <button
                                        className="btn btn-outline-success col-12"
                                        onClick={this.createSession}
                                    >
                                        Sitzung hinzufügen
                                    </button>
                                </div>
                            </Dashboard.Tile>
                        </Dashboard.Column>
                    </Dashboard.Row>
                    <Dashboard.Row>
                        <Dashboard.Column>
                            <Dashboard.Tile title="Filter">
                                <div className="row m-2 g-2">
                                    <div className="input-group col-12 p-0 m-0">
                                        <div
                                            className="input-group-text"
                                            style={{ minWidth: '4em' }}
                                        >
                                            Von
                                        </div>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            id="stats-range-start"
                                            required
                                            min="2022-01-01T00:00"
                                            defaultValue={localInputFormat(
                                                this.state.statsRangeStart
                                            )}
                                        />
                                    </div>
                                    <div className="input-group col-12 p-0">
                                        <div
                                            className="input-group-text"
                                            style={{ minWidth: '4em' }}
                                        >
                                            Bis
                                        </div>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            id="stats-range-end"
                                            required
                                            min="2022-01-01T00:00"
                                            defaultValue={localInputFormat(
                                                this.state.statsRangeEnd
                                            )}
                                        />
                                    </div>
                                    <button
                                        className="btn btn-outline-primary col-12"
                                        onClick={this.applyStatsRange}
                                    >
                                        Anwenden
                                    </button>
                                </div>
                            </Dashboard.Tile>
                        </Dashboard.Column>
                    </Dashboard.Row>
                </Dashboard.Column>
                <Dashboard.Column sizes={{ lg: 9 }}>
                    <Dashboard.Tile
                        title="Statistiken"
                        help="Statistiken für den ausgewählten Zeitraum."
                        grow
                    >
                        <WorkingTimeStats
                            sessions={sessions}
                            start={this.state.statsRangeStart}
                            end={this.state.statsRangeEnd}
                        />
                    </Dashboard.Tile>
                </Dashboard.Column>

                <Dashboard.Column>
                    <Dashboard.Tile
                        title="Erfasste Zeiten"
                        help="Erfasste Zeiten im ausgewählten Zeitraum."
                    >
                        <SessionTable
                            sessions={sessions}
                            selectedTeam={this.props.selectedTeam}
                        />
                    </Dashboard.Tile>
                </Dashboard.Column>
            </Dashboard.Page>
        );
    }
}
