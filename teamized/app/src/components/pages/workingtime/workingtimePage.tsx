import React, { useEffect, useId, useState, useReducer } from 'react';

import { errorAlert } from '../../../utils/alerts';
import * as Navigation from '../../../utils/navigation';
import * as WorkingTime from '../../../utils/workingtime';
import * as Cache from '../../../utils/cache';
import * as Dashboard from '../../common/dashboard';
import * as Stats from '../../../utils/workingtimestats';
import { localInputFormat, roundDays } from '../../../utils/datetime';
import WorksessionTable from './worksessionTable';
import WorkingTimeStats from './workingtimeStats';
import { Worksession } from '../../../interfaces/workingtime/worksession';
import { Team } from '../../../interfaces/teams/team';
import WorksessionTrackingTileContent from './worksessionTrackingTileContent';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface Props {
    team: Team;
}

export default function WorkingtimePage({ team }: Props) {
    const [, forceComponentUpdate] = useReducer((x) => x + 1, 0);

    const [statsRangeStart, setStatsRangeStart] = useState(
        roundDays(new Date(new Date().getTime() - 7 * ONE_DAY_MS))
    );
    const [statsRangeEnd, setStatsRangeEnd] = useState(
        roundDays(new Date(), 1)
    );

    const statsRangeStartId = useId();
    const statsRangeEndId = useId();

    const applyStatsRange = () => {
        let start = (
            document.getElementById(statsRangeStartId) as HTMLInputElement
        ).valueAsDate;
        let end = (document.getElementById(statsRangeEndId) as HTMLInputElement)
            .valueAsDate;

        if (!start || !end || isNaN(start.valueOf()) || isNaN(end.valueOf())) {
            errorAlert('Was ist das?', 'Ein angegebenes Datum ist ungültig');
            return;
        }
        if (start > end) {
            errorAlert(
                'Hallo Zeitreisender!',
                'Das Startdatum muss vor dem Enddatum liegen.'
            );
            return;
        }
        setStatsRangeStart(start);
        setStatsRangeEnd(end);
    };

    const createSession = async () => {
        await WorkingTime.createWorkSessionPopup(team);
        Navigation.renderPage();
    };

    const allMyWorksessionsInCurrentTeam = Object.values(
        Cache.getTeamData(team.id).me_worksessions
    );
    const loading = Cache.getCurrentTeamData()._state.me_worksessions._initial;

    useEffect(() => {
        if (loading) WorkingTime.getMyWorkSessionsInTeam(team.id); // will re-render page
    });

    let sessions: Worksession[] = Stats.filterByDateRange(
        allMyWorksessionsInCurrentTeam,
        statsRangeStart,
        statsRangeEnd
    ).sort((a, b) => {
        return (
            new Date(b.time_start).getTime() - new Date(a.time_start).getTime()
        );
    });

    return (
        <Dashboard.Page
            title="Deine Arbeitszeit"
            subtitle="Erfasse und verwalte deine Arbeitszeit"
            loading={loading}
        >
            <Dashboard.Column sizes={{ lg: 3 }}>
                <Dashboard.Row>
                    <Dashboard.Column
                        size={12}
                        sizes={{ lg: 12, sm: 6, md: 6 }}
                    >
                        <Dashboard.Tile title="Sitzung aufzeichnen" grow>
                            <WorksessionTrackingTileContent
                                team={team}
                                onFinishedSessionAdded={forceComponentUpdate}
                            ></WorksessionTrackingTileContent>
                        </Dashboard.Tile>
                    </Dashboard.Column>
                    <Dashboard.Column
                        size={12}
                        sizes={{ lg: 12, sm: 6, md: 6 }}
                    >
                        <Dashboard.Tile title="Sitzung erfassen" grow>
                            <p className="ms-1">
                                Aufzeichnung vergessen? Kein Problem. Hier
                                können Sitzungen nachträglich manuell erfasst
                                werden.
                            </p>
                            <div className="row m-2">
                                <button
                                    className="btn btn-outline-success col-12"
                                    onClick={createSession}
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
                                        id={statsRangeStartId}
                                        required
                                        min="2022-01-01T00:00"
                                        defaultValue={localInputFormat(
                                            statsRangeStart
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
                                        id={statsRangeEndId}
                                        required
                                        min="2022-01-01T00:00"
                                        defaultValue={localInputFormat(
                                            statsRangeEnd
                                        )}
                                    />
                                </div>
                                <button
                                    className="btn btn-outline-primary col-12"
                                    onClick={applyStatsRange}
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
                        start={statsRangeStart}
                        end={statsRangeEnd}
                    />
                </Dashboard.Tile>
            </Dashboard.Column>

            <Dashboard.Column>
                <Dashboard.Tile
                    title="Erfasste Zeiten"
                    help="Erfasste Zeiten im ausgewählten Zeitraum."
                >
                    <WorksessionTable
                        sessions={sessions}
                        team={team}
                        loading={loading}
                    />
                </Dashboard.Tile>
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
