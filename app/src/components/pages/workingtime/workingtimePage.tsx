import React, { useEffect, useState } from 'react';

import { Button } from '@/shadcn/components/ui/button';
import Dashboard from '@/teamized/components/common/dashboard';
import { DatePickerWithRange } from '@/teamized/components/common/utils/datetime/dateRangePicker';
import { Worksession } from '@/teamized/interfaces/workingtime/worksession';
import * as WorkingtimeService from '@/teamized/service/workingtime.service';
import { useAppdataRefresh } from '@/teamized/utils/appdataProvider';
import {
    DateRangeRequired,
    getDateRange1Month,
} from '@/teamized/utils/datetime';
import { useCurrentTeamData } from '@/teamized/utils/navigation/navigationProvider';

import WorkingtimeStats from './workingtimeStats';
import WorksessionTable from './worksessionTable';
import WorksessionTrackingTileContent from './worksessionTrackingTileContent';

const WORKSESSION_SORTER = (a: Worksession, b: Worksession) => {
    return new Date(b.time_start).getTime() - new Date(a.time_start).getTime();
};

export default function WorkingtimePage() {
    const refreshData = useAppdataRefresh();

    const teamData = useCurrentTeamData();
    const team = teamData?.team;

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

    const [statsDateRange, setStatsDateRange] =
        useState<DateRangeRequired>(getDateRange1Month());

    const statsSessions: Worksession[] = WorkingtimeService.filterByDateRange(
        allMyWorksessionsInCurrentTeam,
        statsDateRange.from,
        statsDateRange.to
    ).sort(WORKSESSION_SORTER);

    const [tableDateRange, setTableDateRange] =
        useState<DateRangeRequired>(getDateRange1Month());

    const tableSessions: Worksession[] = WorkingtimeService.filterByDateRange(
        allMyWorksessionsInCurrentTeam,
        tableDateRange.from,
        tableDateRange.to
    ).sort(WORKSESSION_SORTER);

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
            </Dashboard.Column>
            <Dashboard.Column sizes={{ xl: 8 }}>
                <Dashboard.CustomCard
                    title="Statistiken"
                    help="Aus dem rechts ausgewählten Zeitraum"
                    action={
                        <DatePickerWithRange
                            defaultValue={statsDateRange}
                            onChange={setStatsDateRange}
                        />
                    }
                    grow
                    wrapInCardContent
                >
                    <WorkingtimeStats
                        sessions={statsSessions}
                        start={statsDateRange.from}
                        end={statsDateRange.to}
                        loading={loading}
                    />
                </Dashboard.CustomCard>
            </Dashboard.Column>

            <Dashboard.Column>
                <Dashboard.CustomCard
                    title="Erfasste Zeiten"
                    help="Im rechts ausgewählten Zeitraum"
                    action={
                        <DatePickerWithRange
                            defaultValue={tableDateRange}
                            onChange={setTableDateRange}
                        />
                    }
                    wrapInCardContent
                >
                    <WorksessionTable
                        sessions={tableSessions}
                        team={team}
                        loading={loading}
                        reportURL={
                            `${window.teamized_globals.home_url}reports/workingtime/${team.id}?` +
                            new URLSearchParams({
                                datetime_from:
                                    tableDateRange.from.toISOString(),
                                datetime_to: tableDateRange.to.toISOString(),
                            }).toString()
                        }
                    />
                </Dashboard.CustomCard>
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
