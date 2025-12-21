import React from 'react';

import { Table } from '@/shadcn/components/ui/table';

interface Props {
    className: string;
    children: React.ReactNode;
}

export default function SimpleTable({
    className = '',
    children,
}: Readonly<Partial<Props>>) {
    const fullClassName = `tw:w-full tw:caption-bottom tw:text-sm ${className}`;

    return <Table className={fullClassName}>{children}</Table>;
}
