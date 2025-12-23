import React, { useEffect } from 'react';

import Dashboard from '@/teamized/components/common/dashboard';
import * as CalendarService from '@/teamized/service/calendars.service';
import { useAppdataRefresh } from '@/teamized/utils/appdataProvider';
import { useCurrentTeamData } from '@/teamized/utils/navigation/navigationProvider';

import CalendarsManageTable from './calendarsManageTable';

export default function CalendarsManagePage() {
    const refreshData = useAppdataRefresh();

    const teamData = useCurrentTeamData();
    const team = teamData?.team;

    const calendarsMap = teamData.calendars;
    const calendars = Object.values(calendarsMap);
    const loading = teamData._state.calendars._initial;

    const isAdmin = team.member!.is_admin;

    useEffect(() => {
        if (loading) {
            CalendarService.getCalendars(team.id).then(refreshData);
        }
    }, [loading, team.id, refreshData]);

    return (
        <Dashboard.Page>
            <Dashboard.Column>
                <Dashboard.CustomCard
                    title="Kalender"
                    description="Alle Kalender deines Teams."
                    wrapInCardContent
                >
                    <CalendarsManageTable
                        team={team}
                        calendars={calendars}
                        loading={loading}
                        isAdmin={isAdmin}
                    />
                </Dashboard.CustomCard>
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
