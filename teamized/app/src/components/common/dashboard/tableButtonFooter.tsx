import React from 'react';

interface Props {
    show: boolean;
    noTopBorder: boolean;
    children: React.ReactNode;
}

export function TableButtonFooter({
    show = true,
    noTopBorder = false,
    children,
}: Partial<Props>) {
    if (!show) {
        return null;
    }

    return (
        <tfoot className={noTopBorder ? 'border-top-0' : ''}>
            <tr>
                <td colSpan={100} className="border-bottom-0">
                    <div className="w-100 d-inline-flex justify-content-end gap-2">
                        {children}
                    </div>
                </td>
            </tr>
        </tfoot>
    );
}
