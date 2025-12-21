import React from 'react';

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
        <tfoot className={noTopBorder ? 'tw:border-t-0' : ''}>
            <tr>
                <td colSpan={100} className="tw:border-b-0">
                    <div className="tw:w-full tw:inline-flex tw:justify-end tw:gap-2">
                        {children}
                    </div>
                </td>
            </tr>
        </tfoot>
    );
}
