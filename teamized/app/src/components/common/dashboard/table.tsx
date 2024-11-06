import React from 'react';

interface Props {
    className: string;
    vertical: boolean;
    children: React.ReactNode;
}

export function Table({
    className = '',
    vertical = false,
    children,
}: Partial<Props>) {
    let fullClassName = `table mb-0 ${className}`;

    if (!vertical) {
        fullClassName += ' align-middle';
    }

    return <table className={fullClassName}>{children}</table>;
}
