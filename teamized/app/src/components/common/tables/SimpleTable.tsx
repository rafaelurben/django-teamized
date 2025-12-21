import React from 'react';

interface Props {
    className: string;
    children: React.ReactNode;
}

export default function SimpleTable({
    className = '',
    children,
}: Readonly<Partial<Props>>) {
    const fullClassName = `tw:w-full tw:caption-bottom tw:text-sm ${className}`;

    return <table className={fullClassName}>{children}</table>;
}
