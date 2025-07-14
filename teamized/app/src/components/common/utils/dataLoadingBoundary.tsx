import React, { Suspense } from 'react';

interface Props {
    children: React.ReactNode;
}

export default function DataLoadingBoundary({ children }: Props) {
    return (
        <Suspense fallback={<p>⌛ Daten werden geladen...</p>}>
            {children}
        </Suspense>
    );
}
