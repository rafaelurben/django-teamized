import { ClockIcon, SigmaIcon } from 'lucide-react';
import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
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
        label: 'Dauer (h)',
        color: 'var(--chart-1)',
        icon: ClockIcon,
    },
    unit_count: {
        label: 'Einheiten',
        color: 'var(--chart-2)',
        icon: SigmaIcon,
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
        return <Skeleton className="tw:w-full tw:h-125" />;
    }

    return (
        <>
            <div className="tw:flex tw:items-center tw:mb-4">
                <span className="tw:text-muted-foreground tw:text-sm">
                    Gesamtdauer: {totalHours.toFixed(2)}h / Anzahl Einheiten:{' '}
                    {totalUnitCount}
                </span>
            </div>
            <ChartContainer config={chartConfig} className="tw:w-full tw:h-125">
                <BarChart
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
                        tickMargin={10}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                    />
                    <ChartLegend
                        content={<ChartLegendContent hideIcon={true} />}
                    />
                    <Bar
                        dataKey="duration_h"
                        fill="var(--color-duration_h)"
                        radius={8}
                    />
                    <Bar
                        dataKey="unit_count"
                        fill="var(--color-unit_count)"
                        radius={8}
                    />
                </BarChart>
            </ChartContainer>
        </>
    );
}
