import React from 'react';

import { TableCell, TableRow } from '@/shadcn/components/ui/table';

interface Props {
    show: boolean;
    noTopBorder: boolean;
    children: React.ReactNode;
}

export default function ButtonFooter({
    show = true,
    noTopBorder = false,
    children,
}: Readonly<Partial<Props>>) {
    if (!show) {
        return null;
    }

    return (
        <tfoot className={noTopBorder ? 'tw:border-t-0' : 'tw:border-t'}>
            <TableRow className="tw:border-b-0">
                <TableCell colSpan={100}>
                    <div className="tw:w-full tw:inline-flex tw:justify-end tw:gap-2">
                        {children}
                    </div>
                </TableCell>
            </TableRow>
        </tfoot>
    );
}
