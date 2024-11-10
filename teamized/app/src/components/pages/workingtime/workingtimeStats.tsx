import React from 'react';
import * as Recharts from 'recharts';

import * as Stats from '../../../utils/workingtimestats';
import { Worksession } from '../../../interfaces/workingtime/worksession';

interface Props {
    sessions: Worksession[];
    start: Date;
    end: Date;
}

export default function WorkingtimeStats({ sessions, start, end }: Props) {
    let data = Stats.chartDataByDays(sessions, start, end);
    let totalHours = Stats.totalDuration(sessions) / 3600;

    return (
        <>
            <div className="row row-cols-lg-auto m-1 g-2 align-items-center">
                <div className="col-12 mt-0">
                    <span className="text-muted">
                        Gesamtdauer: {totalHours.toFixed(2)}h
                    </span>
                </div>
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
