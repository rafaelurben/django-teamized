import React from 'react';

interface Props {
    loading: boolean;
    title: React.ReactNode | null;
    subtitle: React.ReactNode | null;
    text: React.ReactNode | null;
    children: React.ReactNode;
}

export function Page({
    loading = false,
    title = null,
    subtitle = null,
    text = null,
    children,
}: Partial<Props>) {
    return (
        <div className="dashboard p-0 w-100 h-100 d-flex flex-column">
            {title && (
                <h4 key="title" className="dashboard-title pt-3 mx-3 text-bold">
                    {title}
                </h4>
            )}
            {subtitle && (
                <h5 key="subtitle" className="dashboard-subtitle mt-2 mx-3">
                    {subtitle}
                </h5>
            )}
            {text && (
                <p key="text" className="dashboard-text mt-2 mx-3">
                    {text}
                </p>
            )}
            {loading ? (
                <div className="w-100 flex-grow-1 d-flex flex-column align-items-center justify-content-center">
                    <div className="spinner-border mb-3" role="status">
                        <span className="visually-hidden">Laden...</span>
                    </div>
                    <p>Seite wird geladen...</p>
                </div>
            ) : (
                <div className="dashboard-row row w-100 g-0 ms-0 px-2 pt-2">
                    {children}
                </div>
            )}
        </div>
    );
}
