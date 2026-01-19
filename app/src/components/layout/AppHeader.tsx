import React, { useMemo } from 'react';

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
import { PAGE_CONFIGS } from '@/teamized/components/pages/pageConfigs';
import {
    useNavigationState,
    usePageNavigatorAsEventHandler,
    usePageNavigatorURL,
} from '@/teamized/utils/navigation/navigationProvider';

export type Breadcrumbs = {
    label: string;
    page: string;
    description?: string;
}[];

export function calculateBreadcrumbs(page: string) {
    const breadcrumbs: Breadcrumbs = [];

    function addBreadcrumbsRecursively(pageKey: string) {
        const config = PAGE_CONFIGS[pageKey];
        if (!config) return;

        if (config.inheritFrom) {
            addBreadcrumbsRecursively(config.inheritFrom);
        }

        breadcrumbs.push({
            label: config.title,
            page: pageKey,
            description: config?.description,
        });
    }

    addBreadcrumbsRecursively(page);
    return breadcrumbs;
}

export default function AppHeader() {
    const selectPage = usePageNavigatorAsEventHandler();
    const getPageURL = usePageNavigatorURL();
    const { selectedPage } = useNavigationState();

    const breadcrumbs = useMemo(
        () => calculateBreadcrumbs(selectedPage),
        [selectedPage]
    );

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
