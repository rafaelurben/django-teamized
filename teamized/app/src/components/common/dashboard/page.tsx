import React from 'react';

import Row from '@/teamized/components/common/dashboard/row';

interface Props {
    children: React.ReactNode;
}

export default function Page({ children }: Readonly<Partial<Props>>) {
    return (
        <div className="dashboard tw:p-1 tw:w-full tw:h-auto tw:flex tw:flex-col">
            <Row>{children}</Row>
        </div>
    );
}
