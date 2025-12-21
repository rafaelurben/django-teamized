import React, { useEffect, useId, useState } from 'react';

import { Worksession } from '../../../interfaces/workingtime/worksession';
import * as WorkingtimeService from '../../../service/workingtime.service';
import { errorAlert } from '../../../utils/alerts';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import { localInputFormat, roundDays } from '../../../utils/datetime';
import { useCurrentTeamData } from '../../../utils/navigation/navigationProvider';
import Dashboard from '../../common/dashboard';
import WorkingtimeStats from './workingtimeStats';
import WorksessionTable from './worksessionTable';
import WorksessionTrackingTileContent from './worksessionTrackingTileContent';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export default function WorkingtimePage() {
    const refreshData = useAppdataRefresh();

    const teamData = useCurrentTeamData();
    const team = teamData?.team;

    const [statsRangeStart, setStatsRangeStart] = useState(
        roundDays(new Date(new Date().getTime() - 7 * ONE_DAY_MS))
    );
    const [statsRangeEnd, setStatsRangeEnd] = useState(
        roundDays(new Date(), 1)
    );

    const statsRangeStartId = useId();
    const statsRangeEndId = useId();

    const applyStatsRange = () => {
        const startVal = (
            document.getElementById(statsRangeStartId) as HTMLInputElement
        ).value;
        const start = new Date(startVal);
        const endVal = (
            document.getElementById(statsRangeEndId) as HTMLInputElement
        ).value;
        const end = new Date(endVal);
        console.log(startVal, start, endVal, end);

        if (!startVal || !endVal || !start || !end) {
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

    const createSession = () => {
        WorkingtimeService.createWorkSessionPopup(team).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const generateReport = () => {
        window.open(
            `${window.teamized_globals.home_url}reports/workingtime/${team.id}?` +
                new URLSearchParams({
                    datetime_from: statsRangeStart.toISOString(),
                    datetime_to: statsRangeEnd.toISOString(),
                }).toString(),
            '_blank'
        );
    };

    const allMyWorksessionsInCurrentTeam = Object.values(
        teamData.me_worksessions
    );
    const loading = teamData._state.me_worksessions._initial;

    useEffect(() => {
        if (loading) {
            WorkingtimeService.getMyWorkSessionsInTeam(team.id).then(
                refreshData
            );
        }
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
        <Dashboard.Page loading={loading}>
            <Dashboard.Column sizes={{ lg: 3 }}>
                <Dashboard.Row>
                    <Dashboard.Column sizes={{ lg: 12, sm: 6, md: 6 }}>
                        <Dashboard.CustomCard title="Sitzung aufzeichnen" grow>
                            <WorksessionTrackingTileContent
                                team={team}
                            ></WorksessionTrackingTileContent>
                        </Dashboard.CustomCard>
                    </Dashboard.Column>
                    <Dashboard.Column sizes={{ lg: 12, sm: 6, md: 6 }}>
                        <Dashboard.CustomCard title="Sitzung erfassen" grow>
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
                        </Dashboard.CustomCard>
                    </Dashboard.Column>
                </Dashboard.Row>
                <Dashboard.Row>
                    <Dashboard.Column>
                        <Dashboard.CustomCard title="Filter">
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
                        </Dashboard.CustomCard>
                    </Dashboard.Column>
                </Dashboard.Row>
            </Dashboard.Column>
            <Dashboard.Column sizes={{ lg: 9 }}>
                <Dashboard.CustomCard
                    title="Statistiken"
                    help="Statistiken für den ausgewählten Zeitraum."
                    grow
                >
                    <WorkingtimeStats
                        sessions={sessions}
                        start={statsRangeStart}
                        end={statsRangeEnd}
                    />
                </Dashboard.CustomCard>
            </Dashboard.Column>

            <Dashboard.Column>
                <Dashboard.CustomCard
                    title="Erfasste Zeiten"
                    help="Erfasste Zeiten im ausgewählten Zeitraum."
                >
                    <WorksessionTable
                        sessions={sessions}
                        team={team}
                        loading={loading}
                    />
                    {!loading && sessions.length > 0 && (
                        <button
                            className="btn btn-outline-success mt-2"
                            onClick={generateReport}
                        >
                            PDF-Report generieren
                        </button>
                    )}
                </Dashboard.CustomCard>
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
