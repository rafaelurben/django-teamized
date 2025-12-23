import React, { useEffect, useId, useState } from 'react';

import { Button } from '@/shadcn/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/shadcn/components/ui/field';
import { Input } from '@/shadcn/components/ui/input';

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
        roundDays(new Date(Date.now() - 7 * ONE_DAY_MS))
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
        <Dashboard.Page>
            <Dashboard.Column sizes={{ xl: 4 }}>
                <Dashboard.Row>
                    <Dashboard.Column sizes={{ xl: 12, sm: 6, md: 6 }}>
                        <Dashboard.CustomCard
                            title="Sitzung aufzeichnen"
                            grow
                            wrapInCardContent
                        >
                            <WorksessionTrackingTileContent
                                team={team}
                            ></WorksessionTrackingTileContent>
                        </Dashboard.CustomCard>
                    </Dashboard.Column>
                    <Dashboard.Column sizes={{ xl: 12, sm: 6, md: 6 }}>
                        <Dashboard.CustomCard
                            title="Sitzung erfassen"
                            grow
                            wrapInCardContent
                        >
                            <p className="tw:text-sm tw:mb-4">
                                Aufzeichnung vergessen? Kein Problem. Hier
                                können Sitzungen nachträglich manuell erfasst
                                werden.
                            </p>
                            <Button
                                variant="success"
                                className="tw:w-full"
                                onClick={createSession}
                            >
                                Sitzung hinzufügen
                            </Button>
                        </Dashboard.CustomCard>
                    </Dashboard.Column>
                </Dashboard.Row>
                <Dashboard.Row>
                    <Dashboard.Column>
                        <Dashboard.CustomCard title="Filter" wrapInCardContent>
                            <FieldGroup className="tw:gap-3">
                                <Field>
                                    <FieldLabel htmlFor={statsRangeStartId}>
                                        Von
                                    </FieldLabel>
                                    <Input
                                        type="datetime-local"
                                        id={statsRangeStartId}
                                        required
                                        min="2022-01-01T00:00"
                                        defaultValue={localInputFormat(
                                            statsRangeStart
                                        )}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor={statsRangeEndId}>
                                        Bis
                                    </FieldLabel>
                                    <Input
                                        type="datetime-local"
                                        id={statsRangeEndId}
                                        required
                                        min="2022-01-01T00:00"
                                        defaultValue={localInputFormat(
                                            statsRangeEnd
                                        )}
                                    />
                                </Field>
                                <Field orientation="horizontal">
                                    <Button
                                        className="tw:w-full"
                                        onClick={applyStatsRange}
                                    >
                                        Anwenden
                                    </Button>
                                </Field>
                            </FieldGroup>
                        </Dashboard.CustomCard>
                    </Dashboard.Column>
                </Dashboard.Row>
            </Dashboard.Column>
            <Dashboard.Column sizes={{ xl: 8 }}>
                <Dashboard.CustomCard
                    title="Statistiken"
                    help="Statistiken für den ausgewählten Zeitraum."
                    grow
                    wrapInCardContent
                >
                    <WorkingtimeStats
                        sessions={sessions}
                        start={statsRangeStart}
                        end={statsRangeEnd}
                        loading={loading}
                    />
                </Dashboard.CustomCard>
            </Dashboard.Column>

            <Dashboard.Column>
                <Dashboard.CustomCard
                    title="Erfasste Zeiten"
                    help="Erfasste Zeiten im ausgewählten Zeitraum."
                    wrapInCardContent
                >
                    <WorksessionTable
                        sessions={sessions}
                        team={team}
                        loading={loading}
                        reportURL={
                            `${window.teamized_globals.home_url}reports/workingtime/${team.id}?` +
                            new URLSearchParams({
                                datetime_from: statsRangeStart.toISOString(),
                                datetime_to: statsRangeEnd.toISOString(),
                            }).toString()
                        }
                    />
                </Dashboard.CustomCard>
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
