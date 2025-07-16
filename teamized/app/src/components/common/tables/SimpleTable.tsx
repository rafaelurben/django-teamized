import React from 'react';

interface Props {
    className: string;
    children: React.ReactNode;
}

export default function SimpleTable({
    className = '',
    children,
}: Partial<Props>) {
    const fullClassName = `table mb-0 ${className}`;

    return <table className={fullClassName}>{children}</table>;
}
