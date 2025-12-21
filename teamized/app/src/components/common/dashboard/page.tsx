import React from 'react';

interface Props {
    loading: boolean;
    children: React.ReactNode;
}

export default function Page({
    loading = false,
    children,
}: Readonly<Partial<Props>>) {
    return (
        <div className="dashboard p-0 w-100 d-flex flex-column">
            {loading ? (
                <div className="w-100 flex-grow-1 d-flex flex-column align-items-center justify-content-center">
                    <div className="spinner-border mb-3" role="status">
                        <span className="visually-hidden">Laden...</span>
                    </div>
                    <p>Seiteninhalt wird geladen...</p>
                </div>
            ) : (
                <div className="dashboard-row row w-100 g-0 ms-0 px-2 pt-2">
                    {children}
                </div>
            )}
        </div>
    );
}
