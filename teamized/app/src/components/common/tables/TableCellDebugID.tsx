import React from 'react';

import { TableCell } from '@/shadcn/components/ui/table';

interface Props {
    id: string;
}

export default function TableCellDebugID({ id }: Readonly<Props>) {
    return (
        <TableCell className="debug-id tw:text-muted-foreground tw:text-xs tw:whitespace-nowrap">
            {id}
        </TableCell>
    );
}
