import React, { useEffect, useId, useReducer, useState } from 'react';

import { Team } from '../../../interfaces/teams/team';
import { Worksession } from '../../../interfaces/workingtime/worksession';
import * as CacheService from '../../../service/cache.service';
import * as NavigationService from '../../../service/navigation.service';
import * as WorkingtimeService from '../../../service/workingtime.service';
import { errorAlert } from '../../../utils/alerts';
import { localInputFormat, roundDays } from '../../../utils/datetime';
import Dashboard from '../../common/dashboard';
import WorkingtimeStats from './workingtimeStats';
import WorksessionTable from './worksessionTable';
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
        const start = (
            document.getElementById(statsRangeStartId) as HTMLInputElement
        ).valueAsDate;
        const end = (
            document.getElementById(statsRangeEndId) as HTMLInputElement
        ).valueAsDate;

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
        await WorkingtimeService.createWorkSessionPopup(team);
        NavigationService.render();
    };

    const allMyWorksessionsInCurrentTeam = Object.values(
        CacheService.getTeamData(team.id).me_worksessions
    );
    const loading =
        CacheService.getCurrentTeamData()._state.me_worksessions._initial;

    useEffect(() => {
        if (loading) WorkingtimeService.getMyWorkSessionsInTeam(team.id); // will re-render page
    });

    const sessions: Worksession[] = WorkingtimeService.filterByDateRange(
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
                    <WorkingtimeStats
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
