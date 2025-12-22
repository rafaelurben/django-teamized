import React from 'react';

import { Skeleton } from '@/shadcn/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shadcn/components/ui/table';

import { Team } from '../../../interfaces/teams/team';
import { Worksession } from '../../../interfaces/workingtime/worksession';
import WorksessionTableRow from './worksessionTableRow';

interface Props {
    team: Team;
    sessions: Worksession[];
    loading: boolean;
}

export default function WorksessionTable({
    sessions,
    team,
    loading,
}: Readonly<Props>) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead style={{ minWidth: '13rem' }}>
                        Start &amp; Ende
                    </TableHead>
                    <TableHead style={{ minWidth: '8rem' }}>Dauer</TableHead>
                    <TableHead style={{ minWidth: '5rem' }}>
                        Einheiten
                    </TableHead>
                    <TableHead style={{ minWidth: '15rem' }}>Notiz</TableHead>
                    <TableHead style={{ width: '1px' }}></TableHead>
                    <TableHead className="debug-id">ID</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <Skeleton className="tw:h-10 tw:w-full" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="tw:h-10 tw:w-full" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="tw:h-10 tw:w-full" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="tw:h-10 tw:w-full" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="tw:h-10 tw:w-full" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="tw:h-10 tw:w-full" />
                            </TableCell>
                        </TableRow>
                    ))
                ) : sessions.length === 0 ? (
                    <TableRow>
                        <TableCell
                            colSpan={6}
                            className="tw:text-center tw:text-muted-foreground"
                        >
                            Noch keine Zeiten im ausgewählten Zeitraum erfasst.
                        </TableCell>
                    </TableRow>
                ) : (
                    sessions.map((session) => (
                        <WorksessionTableRow
                            key={session.id}
                            session={session}
                            team={team}
                        />
                    ))
                )}
            </TableBody>
        </Table>
    );
}
