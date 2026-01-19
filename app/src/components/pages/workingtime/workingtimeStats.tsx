import { Activity } from 'lucide-react';
import React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/shadcn/components/ui/chart';
import { Skeleton } from '@/shadcn/components/ui/skeleton';
import { Worksession } from '@/teamized/interfaces/workingtime/worksession';
import * as WorkingtimeService from '@/teamized/service/workingtime.service';

interface Props {
    sessions: Worksession[];
    start: Date;
    end: Date;
    loading: boolean;
}

const chartConfig = {
    duration_h: {
        label: 'Dauer',
        color: 'var(--chart-1)',
        icon: Activity,
    },
} satisfies ChartConfig;

export default function WorkingtimeStats({
    sessions,
    start,
    end,
    loading,
}: Readonly<Props>) {
    const data = WorkingtimeService.chartDataByDays(sessions, start, end);
    const totalHours = WorkingtimeService.totalDuration(sessions) / 3600;
    const totalUnitCount = WorkingtimeService.totalUnitCount(sessions);

    if (loading) {
        return <Skeleton className="tw:w-full tw:h-100" />;
    }

    return (
        <>
            <div className="tw:flex tw:items-center tw:mb-4">
                <span className="tw:text-muted-foreground tw:text-sm">
                    Gesamtdauer: {totalHours.toFixed(2)}h / Anzahl Einheiten:{' '}
                    {totalUnitCount}
                </span>
            </div>
            <ChartContainer config={chartConfig} className="tw:min-h-[400px]">
                <AreaChart
                    accessibilityLayer
                    data={data}
                    margin={{
                        left: 12,
                        right: 12,
                        top: 12,
                        bottom: 12,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={
                            <ChartTooltipContent
                                hideLabel
                                formatter={(value) => `${value}h`}
                            />
                        }
                    />
                    <Area
                        dataKey="duration_h"
                        type="step"
                        fill="var(--color-duration_h)"
                        fillOpacity={0.4}
                        stroke="var(--color-duration_h)"
                    />
                </AreaChart>
            </ChartContainer>
        </>
    );
}
