import React, { useEffect } from 'react';

import * as CalendarService from '../../../service/calendars.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import { useCurrentTeamData } from '../../../utils/navigation/navigationProvider';
import Dashboard from '../../common/dashboard';
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
    });

    return (
        <Dashboard.Page>
            <Dashboard.Column>
                <Dashboard.CustomCard title="Kalender" wrapInCardContent>
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
