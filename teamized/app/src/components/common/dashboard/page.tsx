import { Loader2 } from 'lucide-react';
import React from 'react';

import Row from '@/teamized/components/common/dashboard/row';

interface Props {
    loading: boolean;
    children: React.ReactNode;
}

export default function Page({
    loading = false,
    children,
}: Readonly<Partial<Props>>) {
    return (
        <div className="dashboard tw:p-1 tw:w-full tw:h-auto tw:flex tw:flex-col">
            {loading ? (
                <div className="tw:w-full tw:flex-grow tw:flex tw:flex-col tw:items-center tw:justify-center">
                    <Loader2 className="tw:size-12 tw:animate-spin tw:mb-3" />
                    <p>Seiteninhalt wird geladen...</p>
                </div>
            ) : (
                <Row>{children}</Row>
            )}
        </div>
    );
}
