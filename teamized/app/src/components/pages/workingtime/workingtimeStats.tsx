import React from 'react';
import * as Recharts from 'recharts';

import { Worksession } from '../../../interfaces/workingtime/worksession';
import * as WorkingtimeService from '../../../service/workingtime.service';

interface Props {
    sessions: Worksession[];
    start: Date;
    end: Date;
}

export default function WorkingtimeStats({
    sessions,
    start,
    end,
}: Readonly<Props>) {
    const data = WorkingtimeService.chartDataByDays(sessions, start, end);
    const totalHours = WorkingtimeService.totalDuration(sessions) / 3600;
    const totalUnitCount = WorkingtimeService.totalUnitCount(sessions);

    return (
        <>
            <div className="tw:flex tw:items-center tw:mb-4">
                <span className="tw:text-muted-foreground tw:text-sm">
                    Gesamtdauer: {totalHours.toFixed(2)}h / Anzahl Einheiten:{' '}
                    {totalUnitCount}
                </span>
            </div>
            <Recharts.ResponsiveContainer
                width="100%"
                minHeight={400}
                height="90%"
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
            </Recharts.ResponsiveContainer>
        </>
    );
}
