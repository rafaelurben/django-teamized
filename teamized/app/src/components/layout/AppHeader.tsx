import React from 'react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/shadcn/components/ui/breadcrumb';
import { Separator } from '@/shadcn/components/ui/separator';
import { SidebarTrigger } from '@/shadcn/components/ui/sidebar';
import IconTooltip from '@/teamized/components/common/tooltips/iconTooltip';
import {
    usePageNavigatorAsEventHandler,
    usePageNavigatorURL,
} from '@/teamized/utils/navigation/navigationProvider';

import { Breadcrumbs } from './pages';

interface Props {
    breadcrumbs: Breadcrumbs;
}

export default function AppHeader({ breadcrumbs }: Readonly<Props>) {
    const selectPage = usePageNavigatorAsEventHandler();
    const getPageURL = usePageNavigatorURL();

    return (
        <header className="tw:flex tw:items-center tw:h-10 tw:gap-2 tw:border-b tw:px-2">
            <SidebarTrigger />
            <Separator
                orientation="vertical"
                className="tw:mr-2 tw:data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
                <BreadcrumbList>
                    {breadcrumbs.map((crumb, index, array) => {
                        if (index === array.length - 1) {
                            return (
                                <BreadcrumbItem key={crumb.page}>
                                    <BreadcrumbPage className="tw:flex tw:items-center">
                                        {crumb.label}
                                        {crumb.description && (
                                            <IconTooltip
                                                title={crumb.description}
                                                className="tw:ml-2 tw:text-muted-foreground"
                                            />
                                        )}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            );
                        } else {
                            return (
                                <React.Fragment key={crumb.page}>
                                    <BreadcrumbItem className="tw:hidden tw:md:block">
                                        <BreadcrumbLink asChild>
                                            <a
                                                href={getPageURL(crumb.page)}
                                                onClick={selectPage(crumb.page)}
                                            >
                                                {crumb.label}
                                            </a>
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="tw:hidden tw:md:block" />
                                </React.Fragment>
                            );
                        }
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </header>
    );
}
